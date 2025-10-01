'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./fields-s3-images.cjs.prod.js");
} else {
  module.exports = require("./fields-s3-images.cjs.dev.js");
}
