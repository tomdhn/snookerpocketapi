const {UserModel} = require("../models/user");

module.exports = async function getUser(req, res, next) {
    let user;
    try {
      user = await UserModel.findById(req.params.id);
      if (user == null) {
        console.log("User not found");
      }
    } catch (error) {
      console.log(error);
    }
    res.user = user;
    next();
  }