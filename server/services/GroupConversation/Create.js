const GroupConversation = require("../../models/GroupConversation");

module.exports = async (data) => {
  const { groupName } = data;
  // console.log("DATA: ", data);

  try {
    const groupExist = await GroupConversation.findOne(
      {},
      {
        groupName: groupName,
      }
    );

    if (groupExist) {
      return { exist: true, message: "Group is already exist", error: false };
    } else {
      const create = await GroupConversation.insertMany(data);
      return {
        exist: false,
        message: "Group Successfully Created!",
        error: false,
      };
    }
  } catch (error) {
    // console.log("ERROR: ", error);
    return { exists: false, message: "Error! Please try again.", error: true };
  }
};
