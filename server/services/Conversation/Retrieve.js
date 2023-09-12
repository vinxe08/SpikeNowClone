const Conversation = require("../../models/Conversation");

module.exports = async (data) => {
  const { user } = data;
  try {
    const conversations = await Conversation.find({
      users: user,
    });

    if (conversations) {
      // console.log("RETRIEVE: tryIF", conversations, user);

      return conversations;
    } else {
      // console.log("RETRIEVE: tryELSE");
      return [];
    }
  } catch (error) {
    // console.log("RETRIEVE: catch");
    return [];
  }
};
