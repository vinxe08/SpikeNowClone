const Users = require("../../models/User");

module.exports = async (data) => {
  const { email } = data;
  try {
    // Check's if the user is already exist
    const response = await Users.find({ email: email });

    // If it exist, send these response
    if (response.length > 0) {
      return {
        error: false,
        userExist: true,
        user: response,
      };
    } else {
      // If not, send these response
      return { error: false, userExist: false };
    }
  } catch (error) {
    return { error: true, userExist: false };
  }
};
