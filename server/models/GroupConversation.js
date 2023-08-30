const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupconversationSchema = new Schema({
  users: [],
  groupName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  background: {
    type: String,
    required: true,
  },
  conversation: [],
  timestamp: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("GroupConversations", groupconversationSchema);
