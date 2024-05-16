const express = require("express");
const router = express.Router();
const {speeldagenModel, validateSpeeldag} = require("../models/speeldag");
const {seizoenModel, validateSeizoen} = require("../models/seizoen");
const {klassementEntryModel} = require("../models/klassementEntry");
const getSeizoen = require("../middleware/getSeizoen");
const genereerSeizoenKlassement = require("../middleware/genereerSeizoenKlassement");
const getAuth = require("../middleware/getAuth");
const getAdmin = require("../middleware/getAdmin");
const c = require("config");



//getOne
router.get("/:id",/* getAuth */ getSeizoen,  async (req, res) => {
  /** #swagger.tags = ['Seizoen'] 
   *  #swagger.summary = 'get one seizoenen by id'
  */
  try {
    seizoen = await seizoenModel.findById(req.params.id).populate("speeldagen").populate("klassement");
    res.status(200).json(seizoen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
});

//getAll
router.get("/",/* getAuth, */ async (req, res) => {
  /** #swagger.tags = ['Seizoen'] 
  * #swagger.summary = 'get all seizoenen'
  */
  try {
    const seizoenen = await seizoenModel.find().populate({
      path: 'speeldagen',
      populate: { path: 'wedstrijden' }
    }).populate('klassement');
    res.status(200).json(seizoenen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//post
router.post("/", /* getAuth, */ async (req, res) => {
  /** #swagger.tags = ['Seizoen'] 
  * #swagger.summary = 'add a new seizoen'
  */

  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Add new seizoen.',
            schema: { $ref: '#/definitions/AddSeizoen' }
    } */
  const { error } = validateSeizoen(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const seizoen = new seizoenModel({
    bevriesKlassement: req.body.bevriesKlassement,
    klassement: req.body.klassement,
    speeldagen: req.body.speeldagen,
    startdatum: req.body.startdatum,
    seizoenBeeindigd: req.body.seizoenBeeindigd,
    aantalJokers: req.body.aantalJokers
  });
  try {
    const newSeizoen = await seizoen.save();
    res.status(201).json(newSeizoen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//delete
router.delete("/:id", /* getAuth,  getAdmin,*/  getSeizoen,  async (req, res) => {
  /* #swagger.tags = ['Seizoen'] */
  try {
    await res.seizoen.deleteOne()
    res.status(204).json({ message: "Deleted Seizoen" })
  } catch (err) {
      res.status(500).json({ message: err.message })
  }
});

//patch
router.patch("/:id", /* getAuth, */ getSeizoen,  async (req, res) => {
  /* #swagger.tags = ['Seizoen'] */

  if (req.body.bevriesKlassement != null) {
    res.seizoen.bevriesKlassement = req.body.bevriesKlassement
  }
  if (req.body.klassement != null) {
    res.seizoen.klassement = req.body.klassement
  }
  if (req.body.speeldagen != null) {
    res.seizoen.speeldagen = req.body.speeldagen
  }
  if (req.body.startdatum != null) {
    res.seizoen.startdatum = req.body.startdatum
  }
  if (req.body.seizoenBeeindigd != null) {
    res.seizoen.seizoenBeeindigd = req.body.seizoenBeeindigd
  }
  if (req.body.aantalJokers != null) {
    res.seizoen.aantalJokers = req.body.aantalJokers
  }

  try {
    const updatedSeizoen = await res.seizoen.save({ validateModifiedOnly: true });
    res.status(201).json(updatedSeizoen)
  } catch (err) {
      res.status(400).json({ message: err.message })
  }
});


/* ### SPEELDAGEN ### */

//get ALL SPEELDAGEN
router.get("/:id/speeldagen", /* getAuth, getSeizoen, */ async (req, res) => {
  /* #swagger.tags = ['Seizoen'] */
  try {
      // Populate "speeldagen" field of the "res.seizoen" object
      const seizoen = await res.seizoen.populate("speeldagen");

      // Ensure "speeldagen" field is populated
      if (!seizoen.speeldagen) {
          return res.status(404).json({ message: "Speeldagen not found for this seizoen" });
      }

      // Send the populated "speeldagen" field in the response
      res.status(200).json(seizoen.speeldagen.reverse()); // do a barrel roll
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

//post Speeldag
router.post("/:id/speeldagen", /* getAuth, getAdmin, */ getSeizoen, async (req, res) => {
  /* #swagger.tags = ['Seizoen'] */

  const { error } = validateSpeeldag(req.body);
  if (error) {
    console.log(error)
    return res.status(400).send(error.details[0].message)
  };

  const speeldag = new speeldagenModel({
    schiftingsantwoord: req.body.schiftingsantwoord,
    schiftingsvraag: req.body.schiftingsvraag,
    wedstrijden: req.body.wedstrijden,
    speeldagVotes: req.body.speeldagVotes,
    klassement: req.body.klassement,
    startDatum: req.body.startDatum,
    eindDatum: req.body.eindDatum
  });

  try {
    const newSpeeldag = await speeldag.save();
    res.seizoen.speeldagen.push(newSpeeldag)
    const newSeizoen = await res.seizoen.save();
    res.status(201).json(newSeizoen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ### KLASSEMENT ### */

//get klassement
router.get("/:id/klassement", getSeizoen, async (req, res) => {

  /* #swagger.tags = ['Klassement'] */
  try{
    const seizoen = await res.seizoen.populate({
      path: "klassement",
      model: "klassementEntry"
    });
    res.status(200).json(seizoen.klassement);
  }catch(err){
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/latestklassement", async (req, res) => {
  /** #swagger.tags = ['Klassement'] 
   *  #swagger.summary = 'get latest klassement'
  */
  //console.lsog("test")
  try{
      //get last season of array
    const seizoen = (await seizoenModel.find()).filter(seizoen => !seizoen.seizoenBeeindigd)[0];
    const currentSeizoen = await seizoen.populate("klassement");
    res.status(200).json(currentSeizoen.klassement);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

router.post("/klassement", async (req, res) => {
  /** #swagger.tags = ['Klassement'] 
   *  #swagger.summary = 'update klassement'
  */
  const seizoen = (await seizoenModel.find()).filter(seizoen => !seizoen.seizoenBeeindigd)[0];
  // delete all klassementEntries
  seizoen.klassement = [];
  await seizoen.save();
  //delete all klassementEntries from klassmentEntryModel
  const klassementEntries = await klassementEntryModel.find();
  klassementEntries.forEach(async (klassementEntry) => {
    await klassementEntryModel.findByIdAndDelete(klassementEntry._id);
  });
 
  await genereerSeizoenKlassement(req, res)
  res.status(200).json({ message: "Klassement generated succesfully" })
})

module.exports = router;





