const Users = require("../../models/User");

module.exports = async (data) => {
  const { email } = data;
  try {
    const response = await Users.find({ email: email });

    console.log("CREATE: TRY");
    if (response.length > 0) {
      return { error: false, userExist: true };
    } else {
      await Users.insertMany(data);
      return { error: false, userExist: false };
    }
  } catch (error) {
    console.log("CREATE: CATCH", error);
    return { error: true, userExist: false };
  }
};
