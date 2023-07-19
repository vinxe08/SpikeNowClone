const Users = require("../../models/User");

module.exports = async (data) => {
  const { username } = data;
  try {
    const data = await Users.find({ username: { $ne: username } });
    return data;
  } catch (error) {
    return [];
  }
};
