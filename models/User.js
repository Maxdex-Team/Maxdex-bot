const mongo = require("mongoose");

module.exports = mongo.model(
  "user",
  new mongo.Schema({
    id: String,
    username: String,
    balls: [{
      name: String,
    }],
  })
);
