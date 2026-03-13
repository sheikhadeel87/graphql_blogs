require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const cors = require("cors");
const path = require("path");
// const multer = require("multer");
const connectDB = require("./config/db");

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
// graphql-upload is ESM-only; middleware is loaded dynamically below

connectDB();

const app = express();
app.use(cors());
// graphqlUploadExpress must run before body parser so multipart requests are handled correctly

const uploadsDir = path.join(__dirname, "uploads");
const fs = require("fs");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

(async () => {
  const { default: graphqlUploadExpress } = await import("graphql-upload/graphqlUploadExpress.mjs");
  const { default: GraphQLUpload } = await import("graphql-upload/GraphQLUpload.mjs");

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  app.use(express.json());

  // Build schema explicitly so Mutation.enhanceWithAI is guaranteed to be present
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: { ...resolvers, Upload: GraphQLUpload },
  });
  const mutationType = schema.getType("Mutation");
  if (!mutationType || !mutationType.getFields().enhanceWithAI) {
    throw new Error("Schema build failed: Mutation.enhanceWithAI is missing. Check server/schema/typeDefs.js");
  }

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req, uploadsDir }),
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  app.listen(5005, () => {
    console.log("Server running at http://localhost:5005");
    console.log("GraphQL at http://localhost:5005/graphql");
    console.log("Uploads at http://localhost:5005/uploads");
  });
})();
