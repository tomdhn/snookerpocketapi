const express = require("express");
const router = express.Router();
const {
    speeldagVoteModel,
    validateSpeeldagVotes
} = require("../models/speeldagVote");
const {
    speeldagenModel
} = require("../models/speeldag");
const {
    ObjectId
} = require('mongodb');
const {
    wedstrijdVotesModel
} = require("../models/wedstrijdVote");
const getSpeeldag = require("../middleware/getSpeeldag");
const getSpeeldagVote = require("../middleware/getSpeeldagVotes");
const c = require("config");

/*
#############################################
#   NIET MEER NODIG --- MAG EIGENLIJK WEG   #
#############################################
*/

//getAll
router.get("/", async (req, res) => {
    /* #swagger.tags = ['SpeeldagVote'] */
    // #swagger.deprecated = true
    try {
        const speeldagVotes = await speeldagVoteModel.find();
        res.json(speeldagVotes);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

//getOne
router.get("/:id", getSpeeldagVote, (req, res) => {
    /* #swagger.tags = ['SpeeldagVote'] */
    // #swagger.deprecated = true
    res.status(200).json(res.speeldagVote);
});

router.get('/:speeldagId/:userId/votes', async (req, res) => {
    try {
        const speeldagId = req.params.speeldagId;
        const userId = req.params.userId;

        const wedstrijdenVotes = await getWedstrijdenVotes(speeldagId, userId);

        res.status(200).json(wedstrijdenVotes);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
});


module.exports = router;
//post
router.put("/:id", getSpeeldag, async (req, res) => {
    console.log("body",req.body, "\n----------------\n");
    try {

        /* #swagger.tags = ['SpeeldagVote'] */

        let newWedstrijdvotes = [];
        let newSpeeldagvote;
        if (req.body._id){
            newSpeeldagvote = await speeldagVoteModel.findByIdAndUpdate(
                req.body._id,
                {
                    user: req.body.user,
                    jokerGebruikt: req.body.jokerGebruikt, 
                    SchiftingsvraagAntwoord: req.body.SchiftingsvraagAntwoord
                },
                { new: true } // Return the modified document
            )
        } else {
            if (req.body.wedstrijdVotes !== undefined) {
                for (const wedstrijdVote of req.body.wedstrijdVotes) {
                    const newWedstrijdvote = new wedstrijdVotesModel({
                        vote: wedstrijdVote.vote,
                        wedstrijd: wedstrijdVote.wedstrijd,
                    });
                    await newWedstrijdvote.save();
                    newWedstrijdvotes.push(newWedstrijdvote);
                }

                newSpeeldagvote = new speeldagVoteModel({
                    user: req.body.user,
                    jokerGebruikt: req.body.jokerGebruikt,
                    SchiftingsvraagAntwoord: req.body.SchiftingsvraagAntwoord,
                    wedstrijdVotes: newWedstrijdvotes
                });
            } else {
                newSpeeldagvote = new speeldagVoteModel({
                    user: req.body.user,
                    jokerGebruikt: req.body.jokerGebruikt,
                    SchiftingsvraagAntwoord: req.body.SchiftingsvraagAntwoord,
                });
            }
        }
        
        
        console.log("nieuw",newSpeeldagvote);
        await newSpeeldagvote.save();
        // Use push() method directly on speeldagVotes array
        res.speeldag.speeldagVotes.push(newSpeeldagvote);

        await res.speeldag.save();
        res.status(201).json(res.speeldag); // Sending response back
    } catch (err) {
        console.log("error", err);
        res.status(500).json({
            error: err.message
        }); // Sending error response back
    }
});

router.patch('/update/:id', getSpeeldagVote, async (req, res) => {
    try {
        let populatedResult = await res.speeldagVote.populate({
            path: 'wedstrijdVotes'
        });

        if (req.body.jokerGebruikt !== undefined) {
            populatedResult.jokerGebruikt = req.body.jokerGebruikt;
        }
        if (req.body.SchiftingsvraagAntwoord !== undefined) {
            populatedResult.SchiftingsvraagAntwoord = req.body.SchiftingsvraagAntwoord;
        }
        if (req.body.wedstrijdVotes !== undefined) {
            // Iterate through the wedstrijdVotes array and update each element
            for (const wedstrijdVote of req.body.wedstrijdVotes) {
                // Find the wedstrijdvote by id
                const existingWedstrijdvote = await wedstrijdVotesModel.findById(wedstrijdVote._id);

                if (existingWedstrijdvote) {
                    // Update the existing element with the new data
                    existingWedstrijdvote.vote = wedstrijdVote.vote;
                    existingWedstrijdvote.wedstrijd = wedstrijdVote.wedstrijd;
                    // Save the updated document
                    await existingWedstrijdvote.save();
                } else {
                    // If the wedstrijdvote doesn't exist, create it
                    const newWedstrijdvote = new wedstrijdVotesModel({
                        vote: wedstrijdVote.vote,
                        wedstrijd: wedstrijdVote.wedstrijd,
                    });
                    await newWedstrijdvote.save();
                    populatedResult.wedstrijdVotes.push(newWedstrijdvote);
                    console.log(populatedResult.wedstrijdVotes)
                }
            }
        }

        if (req.body.user !== undefined) {
            populatedResult.user = req.body.user;
        }

        console.log(populatedResult);
        const updatedSpeeldagVote = await populatedResult.save();
        res.status(201).json(updatedSpeeldagVote);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

module.exports = router;

const getWedstrijdenVotes = async function(speeldagId, userId) {
    const speeldag = await speeldagenModel.findById(speeldagId)
        .populate({
            path: 'speeldagVotes',
        });

    if (speeldag.speeldagVotes.length > 0) {
        speeldag.speeldagVotes = speeldag.speeldagVotes.find(speeldagVote => speeldagVote.user == userId);
        const speeldagVoteFromUser = await speeldagVoteModel
                                            .findById(speeldag.speeldagVotes)
                                            .populate({
                                            path: 'wedstrijdVotes',
                                            populate: {
                                                path: 'wedstrijd'
                                            }
                                            });
        if(speeldagVoteFromUser == null) {
            return [];
        } 
        let obj = {
            _id: speeldagVoteFromUser._id,
            jokerGebruikt: speeldagVoteFromUser.jokerGebruikt,
            SchiftingsvraagAntwoord: speeldagVoteFromUser.SchiftingsvraagAntwoord,
        };
        if (speeldagVoteFromUser.wedstrijdVotes.length > 0) {
            obj.wedstrijdVotes = speeldagVoteFromUser.wedstrijdVotes;
            obj._id = speeldagVoteFromUser._id;
        }
        return obj;
    }
    return [];
};