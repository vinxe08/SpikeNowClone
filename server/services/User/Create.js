const Users = require("../../models/User");

module.exports = async (data) => {
  const { email } = data;
  try {
    // Check if these email is already exist
    const response = await Users.find({ email: email });

    // If it exists, send these message
    if (response.length > 0) {
      return { error: false, userExist: true };
    } else {
      // If not, create a user
      await Users.insertMany(data);
      return { error: false, userExist: false };
    }
  } catch (error) {
    return { error: true, userExist: false };
  }
};
