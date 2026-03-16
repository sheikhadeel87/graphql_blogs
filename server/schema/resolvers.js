const mongoose = require("mongoose");
const OpenAI = require("openai").default;
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function saveUploadToDisk(uploadPromise, uploadsDir) {
  const upload = await uploadPromise;
  const ext = path.extname(upload.filename) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const stream = upload.createReadStream();
  const out = fs.createWriteStream(filepath);
  await new Promise((resolve, reject) => {
    stream.pipe(out);
    out.on("finish", resolve);
    out.on("error", reject);
    stream.on("error", reject);
  });
  return `/uploads/${filename}`;
}

// Strict 24-char hex check so values like "USER_ID" or "USER_ID_HERE" never reach Mongoose
const VALID_OBJECTID = /^[a-fA-F0-9]{24}$/;
function isValidObjectId(id) {
  const str = id != null ? String(id) : "";
  return str.length === 24 && VALID_OBJECTID.test(str);
}

async function findUserById(id) {
  const str = id != null ? String(id) : "";
  if (!isValidObjectId(str)) return null;
  try {
    return await User.findById(str);
  } catch {
    return null;
  }
}

async function findPostById(id) {
  if (!isValidObjectId(id)) return null;
  try {
    return await Post.findById(id);
  } catch {
    return null;
  }
}

async function findCommentById(id) {
  if (!isValidObjectId(id)) return null;
  try {
    return await Comment.findById(id);
  } catch {
    return null;
  }
}

const getUserFromReq = (req) => {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) throw new Error("Not authenticated");
    const token = auth.replace("Bearer ", "");
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        throw new Error("Invalid/expired token");
    }
};

const resolvers = {
    Query: {
        users: async () => await User.find(),
        user: async (_, { id }) => await findUserById(id),

        // posts: async (_, { page = 1, limit = 5 }) => {
        //     const skip = (page - 1) * limit;
        //     const [posts, totalPosts] = await Promise.all([
        //         Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        //         Post.countDocuments()
        //     ]);

        posts: async (_, { filter = {}, page = 1, limit = 5 }) => {

            const skip = (page - 1) * limit;
          
            let query = {};
          
            // filter by status (default: only published for public list)
            if (filter.status != null && filter.status !== "") {
              query.status = filter.status;
            }
          
            // search by title
            if (filter.title) {
              query.title = { $regex: filter.title, $options: "i" };
            }
          
            // search by tag
            if (filter.tag) {
              query.tags = filter.tag;
            }
          
            // filter by date
            if (filter.startDate || filter.endDate) {
          
              query.createdAt = {};
          
              if (filter.startDate) {
                query.createdAt.$gte = new Date(filter.startDate);
              }
          
              if (filter.endDate) {
                query.createdAt.$lte = new Date(filter.endDate);
              }
          
            }
          
            // filter by author ID (single author's posts)
            if (filter.authorId && isValidObjectId(filter.authorId)) {
              query.author = new mongoose.Types.ObjectId(filter.authorId);
            }
            // search by author name
            else if (filter.authorName) {
              const users = await User.find({
                name: { $regex: filter.authorName, $options: "i" }
              });
              const userIds = users.map(u => u._id);
              query.author = { $in: userIds };
            }
          
            // sorting
            let sortOption = { createdAt: -1 };
          
            if (filter.sortBy === "oldest") {
              sortOption = { createdAt: 1 };
            } else if (filter.sortBy === "publishedAt") {
              sortOption = { publishedAt: -1 };
            }
          
            const posts = await Post.find(query)
              .sort(sortOption)
              .skip(skip)
              .limit(limit);
          
            const totalPosts = await Post.countDocuments(query);
            return {
                posts,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit),
                currentPage: page
            };
        },

        post: async (_, { id }, context) => {
            const post = await findPostById(id);
            if (!post) return null;
            // increment viewCount when viewing a single post
            post.viewCount = (post.viewCount || 0) + 1;
            await post.save();
            return post;
        },
        postBySlug: async (_, { slug }) => {
            if (!slug || typeof slug !== "string") return null;
            try {
              const post = await Post.findOne({ slug: slug.trim() });
              if (post) {
                post.viewCount = (post.viewCount || 0) + 1;
                await post.save();
              }
              return post;
            } catch {
              return null;
            }
        },
        comments: async () => await Comment.find(),
        comment: async (_, { id }) => await findCommentById(id)
    },
    Mutation: {
        createUser: async (_, { name, email }) => {
            const user = new User({ name, email });
            return await user.save();
        },
        register: async (_, { name, email, password }) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) throw new Error("User already exists");
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ name, email, password: hashedPassword });
            await user.save();
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
            return { token, user };
        },
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) throw new Error("User not found");
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error("Invalid password");
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
            return { token, user };
        },
        createPost: async (_, { title, content, userId, coverImage, tags, status, publishedAt, slug }, context) => {
            if (!isValidObjectId(userId)) throw new Error("Invalid user ID");
            const tagList = Array.isArray(tags) ? [...tags] : [];
            const payload = {
              title,
              content,
              author: userId,
              coverImage: coverImage || null,
              tags: tagList,
              status: status || "draft",
              publishedAt: publishedAt ? new Date(publishedAt) : (status === "published" ? new Date() : null),
            };
            if (slug != null && String(slug).trim()) payload.slug = String(slug).trim();
            const post = new Post(payload);
            return await post.save();
        },
        createComment: async (_, { text, postId, userId }) => {
            const comment = new Comment({ text, postId, userId });
            return await comment.save();
        },
        updatePost: async (_, { id, title, content, coverImage, tags, status, publishedAt, slug }, { req }) => {
            const user = getUserFromReq(req);
            const post = await findPostById(id);
            if (!post) throw new Error("Post not found");
            if (post.author && post.author.toString() !== user.userId) throw new Error("Not authorized");
            if (title !== undefined) post.title = title;
            if (content !== undefined) post.content = content;
            if (coverImage !== undefined) post.coverImage = coverImage || null;
            if (tags !== undefined) post.tags = Array.isArray(tags) ? [...tags] : [];
            if (status !== undefined) post.status = status;
            if (publishedAt !== undefined) post.publishedAt = publishedAt ? new Date(publishedAt) : null;
            if (status === "published" && !post.publishedAt) post.publishedAt = new Date();
            if (slug !== undefined && slug != null) post.slug = String(slug).trim() || undefined;
            await post.save();
            return post;
        },
        deletePost: async (_, { id }, { req }) => {
            const user = getUserFromReq(req);
            const post = await findPostById(id);
            if (!post) throw new Error("Post not found");
            if (post.author && post.author.toString() !== user.userId) throw new Error("Not authorized");
            await post.deleteOne();
            return true;
        },
        updateComment: async (_, { id, text }, { req }) => {
            const user = getUserFromReq(req);
            const comment = await findCommentById(id);
            if (!comment) throw new Error("Comment not found");
            if (comment.userId && comment.userId.toString() !== user.userId) throw new Error("Not authorized");
            comment.text = text;
            await comment.save();
            return comment;
        },
        deleteComment: async (_, { id }, { req }) => {
            const user = getUserFromReq(req);
            const comment = await findCommentById(id);
            if (!comment) throw new Error("Comment not found");
            if (comment.userId && comment.userId.toString() !== user.userId) throw new Error("Not authorized");
            await comment.deleteOne();
            return true;
        },
        updateUser: async (_, { id, name, email, password, avatar }, { req }) => {
            const user = getUserFromReq(req);
            if (!isValidObjectId(id) || user.userId !== id) throw new Error("Not authorized");
            const update = {};
            if (name !== undefined) update.name = name;
            if (email !== undefined) update.email = email;
            if (password !== undefined) {
                update.password = await bcrypt.hash(password, 10);
            }
            if (avatar !== undefined) update.avatar = avatar || null;
            const updatedUser = await User.findByIdAndUpdate(id, update, { new: true });
            if (!updatedUser) throw new Error("User not found");
            return updatedUser;
        },
        deleteUser: async (_, { id }, { req }) => {
            const user = getUserFromReq(req);
            if (!isValidObjectId(id) || user.userId !== id) throw new Error("Not authorized");
            const deletedUser = await User.findByIdAndDelete(id);
            return !!deletedUser;
        },
        singleUpload: async (_, { file }, context) => {
            const uploadsDir = context.uploadsDir;
            if (!uploadsDir) throw new Error("Uploads not configured");
            return saveUploadToDisk(file, uploadsDir);
        },
        likePost: async (_, { postId }, { req }) => {
            const user = getUserFromReq(req); // JWT user
            const post = await findPostById(postId);
            if (!post) throw new Error("Post not found");

            // Prevent double like
            if (!post.likedBy.includes(user.userId)) {
              post.likedBy.push(user.userId);
              post.likes = post.likedBy.length;
              await post.save();
            }

            return post;
          },

          unlikePost: async (_, { postId }, { req }) => {
            const user = getUserFromReq(req);
            const post = await findPostById(postId);
            if (!post) throw new Error("Post not found");
        
            // Remove user if they unliked
            post.likedBy = post.likedBy.filter(u => u.toString() !== user.userId);
            post.likes = post.likedBy.length;
            await post.save();
        
            return post;
          },

          enhanceWithAI: async (_, { text }) => {
            return `AI enhanced text for testing: ${text}`;
          },

          followUser: async (_, { userId }, { req }) => {
            const auth = getUserFromReq(req);
            const currentUserId = auth.userId;
            if (!isValidObjectId(userId)) throw new Error("Invalid user ID");
            if (userId === currentUserId) throw new Error("Cannot follow yourself");
            const currentUser = await User.findById(currentUserId);
            const targetUser = await User.findById(userId);
            if (!currentUser) throw new Error("Current user not found");
            if (!targetUser) throw new Error("User to follow not found");
            const targetFollowers = targetUser.followers || [];
            const currentFollowing = currentUser.following || [];
            if (!targetFollowers.some((id) => id.toString() === currentUserId)) {
              targetFollowers.push(currentUserId);
              currentFollowing.push(userId);
              targetUser.followers = targetFollowers;
              currentUser.following = currentFollowing;
              await targetUser.save();
              await currentUser.save();
            }
            return targetUser;
          },

          unfollowUser: async (_, { userId }, { req }) => {
            const auth = getUserFromReq(req);
            const currentUserId = auth.userId;
            if (!isValidObjectId(userId)) throw new Error("Invalid user ID");
            const currentUser = await User.findById(currentUserId);
            const targetUser = await User.findById(userId);
            if (!currentUser) throw new Error("Current user not found");
            if (!targetUser) throw new Error("User not found");
            targetUser.followers = (targetUser.followers || []).filter((id) => id.toString() !== currentUserId);
            currentUser.following = (currentUser.following || []).filter((id) => id.toString() !== userId);
            await targetUser.save();
            await currentUser.save();
            return targetUser;
          },
    },
    User: {
        posts: async (parent) => {
            try {
                const id = parent?.id != null ? String(parent.id) : "";
                return isValidObjectId(id) ? await Post.find({ author: id }) : [];
            } catch {
                return [];
            }
        },
        followers: async (parent) => {
            const ids = parent?.followers;
            if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
            const userIds = ids.map((id) => (id != null ? String(id) : "")).filter(isValidObjectId);
            if (userIds.length === 0) return [];
            return User.find({ _id: { $in: userIds } });
        },
        following: async (parent) => {
            const ids = parent?.following;
            if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
            const userIds = ids.map((id) => (id != null ? String(id) : "")).filter(isValidObjectId);
            if (userIds.length === 0) return [];
            return User.find({ _id: { $in: userIds } });
        },
        followersCount: (parent) => (parent?.followers && Array.isArray(parent.followers) ? parent.followers.length : 0),
        followingCount: (parent) => (parent?.following && Array.isArray(parent.following) ? parent.following.length : 0),
    },
    Post: {
        author: async (parent) => {
            try {
                const authorId = parent?.author != null ? String(parent.author) : "";
                return authorId ? await findUserById(authorId) : null;
            } catch {
                return null;
            }
        },
        comments: async (parent) => {
            try {
                const postId = parent?.id != null ? String(parent.id) : "";
                return postId ? await Comment.find({ postId }) : [];
            } catch {
                return [];
            }
        },
        likedBy: async (parent) => {
            const ids = parent?.likedBy;
            if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
            const userIds = ids.map((id) => (id != null ? String(id) : "")).filter(isValidObjectId);
            if (userIds.length === 0) return [];
            const users = await User.find({ _id: { $in: userIds } });
            return users;
        },
        tags: (parent) => (parent?.tags && Array.isArray(parent.tags) ? parent.tags : []),
        viewCount: (parent) => (parent?.viewCount != null ? parent.viewCount : 0),
        publishedAt: (parent) => (parent?.publishedAt instanceof Date ? parent.publishedAt.toISOString() : parent?.publishedAt ?? null),
        createdAt: (parent) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt ?? null
    },
    Comment: {
        author: async (parent) => {
            try {
                const userId = parent?.userId != null ? String(parent.userId) : "";
                return userId ? await findUserById(userId) : null;
            } catch {
                return null;
            }
        },
        post: async (parent) => (parent?.postId ? await findPostById(parent.postId) : null),
        createdAt: (parent) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt ?? null
    }
};

module.exports = resolvers;
