const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  // users: [
  //   {
  //     user: {
  //       name: {
  //         type: String,
  //         required: true,
  //       },
  //       username: {
  //         type: String,
  //         required: true,
  //       },
  //       accountId: {
  //         type: String,
  //         required: true,
  //       },
  //     },
  //     recipient: {
  //       name: {
  //         type: String,
  //         required: true,
  //       },
  //       username: {
  //         type: String,
  //         required: true,
  //         unique: true,
  //       },
  //       accountId: {
  //         type: String,
  //         required: true,
  //         unique: true,
  //       },
  //     },
  //   },
  // ],
  // convo: [],
  users: [],
});

module.exports = mongoose.model("Conversations", conversationSchema);
