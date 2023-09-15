const Conversation = require("../../models/Conversation");

module.exports = async (data) => {
  const { user } = data;
  try {
    // Retrieve all the conversation of this user
    const conversations = await Conversation.find({
      users: user,
    });

    // If it has, send this info
    if (conversations) {
      return conversations;
    } else {
      // If not, send an empty array
      return [];
    }
  } catch (error) {
    return [];
  }
};
