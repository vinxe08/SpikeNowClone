const GroupConversation = require("../../models/GroupConversation");

module.exports = async (data) => {
  const { email } = data;
  // console.log("DATA: ", data);

  try {
    const groupExist = await GroupConversation.find({
      users: email,
    });
    // console.log("GROUP EXISTS", groupExist);
    if (groupExist) {
      // console.log("IF", groupExist);
      return { error: false, group: groupExist };
    } else {
      // console.log("ELSE ", groupExist);
      return { error: false, group: [] };
    }
  } catch (error) {
    // console.log("ERROR:R ", error);
    return { message: "Error! Please try again.", error: true };
  }
};
