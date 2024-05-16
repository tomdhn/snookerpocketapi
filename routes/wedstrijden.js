const express = require("express");
const router = express.Router();
const {wedstrijdModel, validateWedstrijd } = require("../models/wedstrijd");
const getAuth = require("../middleware/getAuth");
const getAdmin = require("../middleware/getAdmin");
const getWedstrijd = require("../middleware/getWedstrijd");

//getAll
router.get("/", /* getAuth, getAdmin, */ async (req, res) => {
  /* #swagger.tags = ['Wedstrijd'] */
    // #swagger.deprecated = true
  try {
    const wedstrijden = await wedstrijdModel.find();
    res.status(200).json(wedstrijden);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//getOne
router.get("/:id", /* getAuth, getAdmin, */ getWedstrijd, async (req, res) => {
  /* #swagger.tags = ['Wedstrijd'] */
  const wedstrijd = await wedstrijdModel.findById(req.params.id);
  res.status(200).json(wedstrijd);
});

//post
router.post("/", /* getAuth, getAdmin, */ async (req, res) => {
  /* #swagger.tags = ['Wedstrijd'] */
    // #swagger.deprecated = true

  console.log(req.body);
  const { error } = validateWedstrijd(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const wedstrijd = new wedstrijdModel({
    datum: req.body.datum,
    resultaat: req.body.resultaat,
    thuis: req.body.thuis,
    uit: req.body.uit,
  });
  try {
    const newWedstrijd = await wedstrijd.save();
    res.status(201).json(newWedstrijd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//patch
router.patch("/:id", /* getAuth, getAdmin, */ getWedstrijd,  async (req, res) => {
  /* #swagger.tags = ['Wedstrijd'] */
  if (req.body.datum != null) {
    res.wedstrijd.datum = req.body.datum
  }
  if (req.body.resultaat != null) {
    res.wedstrijd.resultaat = req.body.resultaat.toUpperCase()
  }
  if (req.body.thuis != null) {
    res.wedstrijd.thuis = req.body.thuis
  }
  if (req.body.uit != null) {
    res.wedstrijd.uit = req.body.uit
  }
  console.log(res.wedstrijd.resultaat)
  try {
    const updatedWedstrijd = await res.wedstrijd.save({ validateModifiedOnly: true });
    res.status(201).json(updatedWedstrijd)
  } catch (err) {
      res.status(400).json({ message: err.message })
  }
});

//delete
router.delete("/:id", /* getAuth, getAdmin, */ getWedstrijd,  async (req, res) => {
  /* #swagger.tags = ['Wedstrijd'] */
  try {
    await res.wedstrijd.deleteOne()
    res.status(204).json({ message: "Deleted Wedstrijd" });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});


module.exports = router;
