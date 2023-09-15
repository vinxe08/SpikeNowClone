const Conversation = require("../../models/Conversation");
const mongoose = require("mongoose");

module.exports = async (data) => {
  const { id, messageInfo } = data;
  const objectId = new mongoose.Types.ObjectId(id);

  try {
    // Find these that has an _id = objectId and update
    const response = await Conversation.findOneAndUpdate(
      { _id: objectId },
      { $push: { convo: { ...messageInfo, timestamp: new Date() } } },
      { new: true }
    );

    // Return the response to the client
    return response;
  } catch (error) {
    return error;
  }
};
