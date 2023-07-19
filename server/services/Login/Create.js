const Users = require("../../models/User");

module.exports = async (data) => {
  const { name, username, accountId } = data;

  try {
    const userExist = await Users.findOne({ username });
    if (userExist) {
      return true;
    } else {
      await Users.insertMany(data);
      return true;
    }
  } catch (error) {
    return false;
  }
};
