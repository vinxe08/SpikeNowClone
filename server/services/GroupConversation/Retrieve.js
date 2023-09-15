const GroupConversation = require("../../models/GroupConversation");

module.exports = async (data) => {
  const { email } = data;

  try {
    // Check if this group is already exist
    const groupExist = await GroupConversation.find({
      users: email,
    });

    // If the group exist, send this data
    if (groupExist) {
      return { error: false, group: groupExist };
    } else {
      // If not, send an empty data
      return { error: false, group: [] };
    }
  } catch (error) {
    return { message: "Error! Please try again.", error: true };
  }
};
