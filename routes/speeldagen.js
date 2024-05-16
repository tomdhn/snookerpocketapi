const express = require("express");
const router = express.Router();
const { speeldagenModel, validateSpeeldag } = require("../models/speeldag");
const { speeldagVoteModel } = require("../models/speeldagVote");
const { wedstrijdModel, validateWedstrijd } = require("../models/wedstrijd");
const { wedstrijdVotesModel } = require("../models/wedstrijdVote");
const { seizoenModel } = require("../models/seizoen");
const getSpeeldag = require("../middleware/getSpeeldag");
const getWedstrijden = require("../middleware/getWedstrijden");
const genereerWeekKlassement = require("../middleware/genereerWeekKlassement");
const getAuth = require("../middleware/getAuth");
const getAdmin = require("../middleware/getAdmin");
const c = require("config");


//getAll
router.get("/", /* getAuth, */ async (req, res) => {
  /* #swagger.tags = ['Speeldag'] */
  // #swagger.deprecated = true

  try {
    const speeldagen = await speeldagenModel
      .find()
      .populate("speeldagVotes")
      .populate("klassement")
      .populate("wedstrijden");
    res.status(200).json(speeldagen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//getOne
router.get("/:id",/* getAuth, */ getSpeeldag, async (req, res) => {
  /* #swagger.tags = ['Speeldag'] */
  const speeldag = await speeldagenModel
    .findById(req.params.id)
    .populate("speeldagVotes")
    .populate("klassement")
    .populate("wedstrijden");
  res.status(200).json(speeldag);
});

//get wedstrijden

router.get("/:id/wedstrijden", [getSpeeldag, getWedstrijden], async (req, res) => {
  /* #swagger.tags = ['Speeldag'] */
  try{
    res.status(200).json(res.wedstrijd);
  } catch(error){
    res.status(500).json({ message: error.message });
  }
});

//add new wedstrijd
router.post("/:id/wedstrijden", /* getAuth, getAdmin, */ getSpeeldag, async (req, res) => {
  /* #swagger.tags = ['Speeldag'] */
  const { error } = validateWedstrijd(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const wedstrijd = new wedstrijdModel({
    datum: req.body.datum,
    thuis: req.body.thuis,
    uit: req.body.uit,
  });
  try {
    const newWedstrijd = await wedstrijd.save();
    res.speeldag.wedstrijden.push(newWedstrijd);
    await res.speeldag.save();
    res.status(201).json(newWedstrijd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//addSpeeldagVote
router.put("/:id/speeldagVotes",/* getAuth,  */getSpeeldag, async (req, res) => {
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Put new speeldagVote.',
            schema: { $ref: '#/definitions/PutSpeeldagvote' }
    } */

  /* #swagger.tags = ['Speeldag'] */
  const speeldagVotesDB =  await speeldagenModel.findById(req.params.id).populate({
    path: "speeldagVotes",
    populate: {path: "wedstrijdVotes"}
  });
  const speeldagVotes = speeldagVotesDB.speeldagVotes;
  let userVotes = speeldagVotes.filter(vote => vote.user == req.body.user)[0];
  if(!userVotes){
    userVotes = new speeldagVoteModel({
      user: req.body.user,
      jokerGebruikt: req.body.jokerGebruikt,
      SchiftingsvraagAntwoord: req.body.SchiftingsvraagAntwoord,
      wedstrijdVotes: []
    });
    userVotes = await userVotes.save();
  }
 
  const wedstrijdVotes = req.body.WedstrijdVotes;

  const wedstrijdVotesDB = userVotes.wedstrijdVotes;
  let newWedstrijdVote = undefined;
  !wedstrijdVotesDB ? undefined : newWedstrijdVote = wedstrijdVotesDB.filter(vote => vote.wedstrijd == wedstrijdVotes[0].wedstrijd)[0];
  if(!newWedstrijdVote){
    newWedstrijdVote = new wedstrijdVotesModel({
      vote: wedstrijdVotes[0].vote,
      wedstrijd: wedstrijdVotes[0].wedstrijd
    });
    newWedstrijdVote = await  newWedstrijdVote.save();
    userVotes.wedstrijdVotes.push(newWedstrijdVote);
  }else{
    newWedstrijdVote.vote = wedstrijdVotes[0].vote;
    newWedstrijdVote = await  newWedstrijdVote.save();
  }
  
  try {
    const newSpeeldagVote = await userVotes.save();
    res.speeldag.speeldagVotes.push(newSpeeldagVote);
    await res.speeldag.save();
    res.status(201).json(newSpeeldagVote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  });


//ADD SPEELDAG
router.post("/", /* getAuth, getAdmin,  */async (req, res) => {
  /* #swagger.tags = ['Speeldag'] */
  // #swagger.deprecated = true
  const { error } = validateSpeeldag(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const speeldag = new speeldagenModel({
    schiftingsvraag: req.body.schiftingsvraag,
    schiftingsantwoord: req.body.schiftingsantwoord,
    wedstrijden: req.body.wedstrijden,
    speeldagVotes: req.body.speeldagVotes,
    klassement: req.body.klassement,
  });

  try {
    const newSpeeldag = await speeldag.save();
    res.status(201).json(newSpeeldag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//EDIT SPEELDAG
router.patch("/:id",/* getAuth, */ getSpeeldag, async (req, res) => {
  /* #swagger.tags = ['Speeldag'] */

  if (req.body.schiftingsvraag != null) {
    res.speeldag.schiftingsvraag = req.body.schiftingsvraag;
  }
  if (req.body.schiftingsantwoord != null) {
    res.speeldag.schiftingsantwoord = req.body.schiftingsantwoord;
  }
  if (req.body.eindDatum != null) {
    res.speeldag.eindDatum = req.body.eindDatum;
  }

  try {
    const updatedSpeeldag = await res.speeldag.save({ validateModifiedOnly: true });
    res.status(201).json(updatedSpeeldag);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/*KLASSEMENT*/

//get klassement
router.get("/:id/klassement", /* getAuth, */ getSpeeldag, async (req, res) => {
  /* #swagger.tags = ['Klassement'] */
  try{
    const seizoen = await seizoenModel.findOne({
      speeldagen: { $in: res.speeldag },
    });
    if (seizoen.bevriesKlassement) {
      res.status(201).json({ message: "Klassement Bevroren." });
    } else {
      const speeldag = await speeldagenModel.findById(req.params.id).populate(
        {
          path: "klassement",
          model: "klassementEntry"
        }
      );
      console.log("klassement",speeldag.klassement);
      res.status(200).json(speeldag.klassement);
    }
  } catch(error){
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/klassement", async (req, res) => {
  /** #swagger.tags = ['Klassement'] 
   *  #swagger.summary = 'update klassement'
  */
  // delete all klassementEntries
  const speeldag = await speeldagenModel.findById(req.params.id);
  speeldag.klassement = [];
  await speeldag.save();

  await genereerWeekKlassement(req, res)
  res.status(200).json({ message: "Klassement generated succesfully" })
})

module.exports = router;


