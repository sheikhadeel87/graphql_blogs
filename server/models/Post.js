const mongoose = require("mongoose");

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, trim: true, unique: true, sparse: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  coverImage: { type: String, default: null },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  viewCount: { type: Number, default: 0 },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

PostSchema.pre("save", async function () {
  if (this.isModified("title") || !this.slug) {
    let base = slugify(this.title) || "post";
    let slug = base;
    let n = 0;
    const Post = mongoose.model("Post");
    while (await Post.findOne({ slug, _id: { $ne: this._id } })) {
      n += 1;
      slug = `${base}-${n}`;
    }
    this.slug = slug;
  }
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model("Post", PostSchema);
