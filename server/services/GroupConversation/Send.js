const GroupConversation = require("../../models/GroupConversation");
const mongoose = require("mongoose");

module.exports = async (data) => {
  const { _id, messageInfo } = data;
  const objectId = new mongoose.Types.ObjectId(_id);

  try {
    const response = await GroupConversation.findOneAndUpdate(
      { _id: objectId },
      { $push: { conversation: { ...messageInfo, timestamp: new Date() } } },
      { new: true }
    );

    return { response, error: false };
  } catch (error) {
    return { error: true };
  }
};
