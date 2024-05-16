const { klassementEntryModel } = require("../models/klassementEntry");
const { UserModel } = require("../models/user");
const { seizoenModel } = require("../models/seizoen");
const { speeldagenModel } = require("../models/speeldag");
const c = require("config");

module.exports = async function genereerWeekKlassement(req, res) {
  try {
    let speeldag = await speeldagenModel.findById(req.params.id);

    //get all speeldagVotes and populate them with wedstrijdVotes and wedstrijd
    await speeldag.populate({
      path: "speeldagVotes",
      populate: {
        path: "wedstrijdVotes",
        populate: {
          path: "wedstrijd",
        },
      },
    });

    //loop over all user calculate score for each user
    const speeldagVotes = speeldag.speeldagVotes;

    //delete all klassementEntries
    const speeldagKlassement = speeldag.klassement;
    speeldagKlassement.forEach(async (klassementEntry) => {
      await klassementEntryModel.findByIdAndDelete(klassementEntry._id);
    });

    let klassementEntries = await getUpdatedKlassementEntries(
      speeldagVotes
    );


    //sort klassementEntries by score
    klassementEntries.sort((a, b) => (a.score < b.score ? 1 : -1));

    klassementEntries.forEach(async (klassementEntry, i) => {
      klassementEntry.plaats = i + 1;
      await klassementEntry.save();
      i++;
    });
    //push klassementEntries to speeldagklassement
    speeldag = await speeldag.save();
    speeldag.klassement.push(...klassementEntries);
    await speeldag.save();

    //console.log("Klassement regenerated successfully.");
  } catch (error) {
    console.log(error);
  }
}

/* ------------------------------------------
   speeldagen voor seizoen afhalen,
  ✅ seizoen ophalen, === hoe tf gaan we dit doen :> solved it:) actief seizoen ophalen
  ✅ per speeldag alle klassementVotes ophalen,
  ⬛ loop over alle klassementVotes,
  ⬛ scores per user optellen
  ⬛ als joker gebruikt score verdubbelen
  ⬛ klassementEntry updaten
*/

async function getUpdatedKlassementEntries(votes) {

  let klassementEntries = [];

  const users = await UserModel.find();
  for (const user of users) {
    let votesFromUser = votes.filter((vote) => {
        return vote.user.toString() === user._id.toString();
    });

    let scoreOfUser = 0;
    let heefJokerGebruikt;

    if (Array.isArray(votesFromUser)) {
      votesFromUser.forEach(vote => {
        heefJokerGebruikt = vote.jokerGebruikt;
          if (Array.isArray(vote.wedstrijdVotes)) {
              vote.wedstrijdVotes.forEach(wedstrijdVote => {
                  if (wedstrijdVote.vote?.toUpperCase() == wedstrijdVote.wedstrijd.resultaat) {
                      scoreOfUser += 1;
                  }
              });
          }
      });
    }
    
    klassementEntries.push(new klassementEntryModel({
      user: user._id,
      score: scoreOfUser,
      plaats: 0,
      jokerGebruikt: heefJokerGebruikt,
    }));
  }
  return klassementEntries;
}
