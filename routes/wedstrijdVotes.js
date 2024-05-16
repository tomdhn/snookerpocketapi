const express = require("express");
const router = express.Router();
const {wedstrijdVotesModel, validateVote} = require("../models/wedstrijdVote");
const getWedstrijdVote = require("../middleware/getWedstrijdVote");
const getAuth = require("../middleware/getAuth");



//getAll
router.get("/", /* getAuth, */ async (req, res) => {
  /* #swagger.tags = ['WedstrijdVote'] */
    // #swagger.deprecated = true
  try {
    const wedstrijdVotes = await wedstrijdVotesModel.find();
    res.status(200).json(wedstrijdVotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//getOne
router.get("/:id", /* getAuth, */ getWedstrijdVote, (req, res) => {
  /* #swagger.tags = ['WedstrijdVote'] */
    // #swagger.deprecated = true
  res.status(200).json(res.wedstrijdVote);
});

//post
router.post("/", /* getAuth, */ async (req, res) => {
  /* #swagger.tags = ['WedstrijdVote'] */
    // #swagger.deprecated = true
  const { error } = validateVote(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const wedstrijdVote = new wedstrijdVotesModel({
    vote: req.body.vote,
    wedstrijd: req.body.wedstrijd
  });
  try {
    const newWedstrijdVote = await wedstrijdVote.save();
    res.status(201).json(newWedstrijdVote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

