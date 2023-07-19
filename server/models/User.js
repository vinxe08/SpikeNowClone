const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imap_server: {
    type: String,
    required: true,
  },
  imap_port: {
    type: Number,
    required: true,
  },
  imap_username: {
    type: String,
  },
  smtp_server: {
    type: String,
    required: true,
  },
  smtp_port: {
    type: Number,
    required: true,
  },
  smtp_username: {
    type: String,
  },
});

module.exports = mongoose.model("Users", loginSchema);
