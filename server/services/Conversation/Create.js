const Conversation = require("../../models/Conversation");

module.exports = async (data) => {
  const { email, receiver } = data;
  // try {
  //   const usersExist = await Conversation.find({
  //     $or: [
  //       {
  //         "users.user.username": user,
  //         "users.recipient.username": recipient,
  //       },
  //       {
  //         "users.user.username": recipient,
  //         "users.recipient.username": user,
  //       },
  //     ],
  //   });

  //   if (usersExist.length > 0) {
  //     return usersExist;
  //   } else {
  //     const response = await Conversation.insertMany({
  //       users: [{ user, recipient }],
  //     });
  //     return response;
  //   }
  // } catch (error) {
  //   return [];
  // }
  try {
    console.log("CREATE TRY: ", data);
    const usersExist = await Conversation.findOne({
      users: { $all: [email, receiver] },
    });
    if (usersExist) {
      console.log("CREATE TRY-IF: ", data);
      return { userExist: true, error: false, data: usersExist };
    } else {
      console.log("CREATE TRY-ELSE: ", data);
      const response = await Conversation.insertMany({
        users: [email, receiver],
      }); // need to return the data that created

      if (response) {
        console.log("CREATE RESPONSE: ", data);
        const userExist = await Conversation.findOne({
          users: { $all: [email, receiver] },
        });
        return { userExist: false, error: false, data: userExist };
      }

      console.log("SUCCESSFULLY CREATED");
      // return { userExist: false, error: false };
    }
  } catch (error) {
    console.log("CREATE ERROR: ", error);
    return { error };
  }
};
