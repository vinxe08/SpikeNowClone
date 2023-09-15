const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  users: [],
});

module.exports = mongoose.model("Conversations", conversationSchema);
