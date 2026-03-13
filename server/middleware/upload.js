const { graphqlUploadExpress } = require("graphql-upload");

/**
 * GraphQL multipart upload middleware.
 * Use in server before Apollo's applyMiddleware:
 *   app.use(graphqlUploadMiddleware);
 * Options: maxFileSize (bytes), maxFiles (number of files per request).
 */
const graphqlUploadMiddleware = graphqlUploadExpress({
  maxFileSize: 10000000, // 10MB
  maxFiles: 1,
});

module.exports = graphqlUploadMiddleware;
