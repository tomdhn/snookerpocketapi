const express = require("express");
const router = express.Router();
const { UserModel, validateUser } = newFunction();
const getUser = require("../middleware/getUser");
const getAuth = require("../middleware/getAuth");
const getAdmin = require("../middleware/getAdmin");

//getOne
router.get("/:id",/* getAuth, getAdmin, */ getUser, (req, res) => {
  /* #swagger.tags = ['User'] */
  res.status(200).json(res.user);
});

//getAll
router.get("/", /* getAuth , getAdmin, */ async (req, res) => {
  /* #swagger.tags = ['User'] */
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//post
router.post("/", async (req, res) => {
  /* #swagger.tags = ['User'] */
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

      const user = new UserModel({
        admin: req.body.admin,
        betaald: req.body.betaald,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        jokersGebruikt: req.body.jokersGebruikt
      });
    
      try {
        const newUser = await user.save();
        res.status(201).json(newUser);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }

});

//patch
router.patch("/:id",/* getAuth, */ getUser, async (req, res) => {
  /* #swagger.tags = ['User'] */

  if (req.body.admin != null) {
    res.user.admin = req.body.admin;
  }
  if (req.body.betaald != null) {
    res.user.betaald = req.body.betaald;
  }
  if (req.body.username != null) {
    res.user.username = req.body.username;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }
  if (req.body.jokersGebruikt != null){
    res.user.jokersGebruikt = req.body.jokersGebruikt;
  }

  try {
    const updatedUser = await res.user.save({ validateModifiedOnly: true });
    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

function newFunction() {
  return require("../models/user");
}


