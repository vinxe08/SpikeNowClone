const GroupConversation = require("../../models/GroupConversation");

module.exports = async (data) => {
  const { groupName } = data;

  try {
    const groupExist = await GroupConversation.findOne({
      groupName: groupName,
    });

    if (groupExist) {
      console.log("IF: ", groupExist);
      return {
        exist: true,
        message: "Group is already exist",
        error: false,
        groupExist,
      };
    } else {
      console.log("ELSE: ");
      const create = await GroupConversation.insertMany(data);
      if (create) {
        return {
          exist: false,
          message: "Group Successfully Created!",
          error: false,
          group: create[0],
        };
      }
    }
  } catch (error) {
    // console.log("ERROR: ", error);
    return { exists: false, message: "Error! Please try again.", error: true };
  }
};
