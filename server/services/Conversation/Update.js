const Conversation = require("../../models/Conversation");
const mongoose = require("mongoose");

module.exports = async (data) => {
  const { id, messageInfo } = data;
  const objectId = new mongoose.Types.ObjectId(id);

  try {
    const response = await Conversation.findOneAndUpdate(
      { _id: objectId },
      { $push: { convo: { ...messageInfo, timestamp: new Date() } } },
      { new: true }
    );

    return response;
  } catch (error) {
    // return [];
    console.log("ERROR", error);
  }
};
