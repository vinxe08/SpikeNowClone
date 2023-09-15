const Conversation = require("../../models/Conversation");

module.exports = async (data) => {
  const { email, receiver } = data;
  try {
    // Check if the user has conversation with the receiver
    const usersExist = await Conversation.findOne({
      users: { $all: [email, receiver] },
    });

    // If the user & reciever has conversation, send their conversation data
    if (usersExist) {
      return { userExist: true, error: false, data: usersExist };
    } else {
      // if its not, create a new conversation and send the data
      const response = await Conversation.insertMany({
        users: [email, receiver],
      });

      // Get the data and send in the client side
      if (response) {
        const userExist = await Conversation.findOne({
          users: { $all: [email, receiver] },
        });
        return { userExist: false, error: false, data: userExist };
      }
    }
  } catch (error) {
    return { error };
  }
};
