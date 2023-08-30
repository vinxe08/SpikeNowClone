const Users = require("../../models/User");

module.exports = async (data) => {
  const { email } = data;
  try {
    const response = await Users.find({ email: email });
    if (response.length > 0) {
      // console.log("IF");
      return {
        error: false,
        userExist: true,
        user: response,
      };
    } else {
      // console.log("ELSE");
      return { error: false, userExist: false };
    }
  } catch (error) {
    // console.log("ERROR");
    return { error: true, userExist: false };
  }
};
