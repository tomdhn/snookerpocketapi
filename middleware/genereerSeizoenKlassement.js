const { klassementEntryModel } = require("../models/klassementEntry");
const { UserModel } = require("../models/user");
const { seizoenModel } = require("../models/seizoen");
const { speeldagenModel } = require("../models/speeldag");
const c = require("config");

module.exports = async function genereerSeizoenKlassement(req, res) {
    //cooking in progress 🍲

    try {
      const newSeizoenKlassementEntries = [];
    
      const seizoen = (await seizoenModel.find()).filter(seizoen => !seizoen.seizoenBeeindigd)[0];
    
      const currentSeizoen = await seizoen.populate({
        path: "speeldagen",
        populate: [
          {path: "klassement"},
          {
            path: "speeldagVotes",
            populate: {
              path: "wedstrijdVotes",
              populate: {
                path: "wedstrijd"
              }
            }
          }
        ],
      });
    
      const speeldagen = currentSeizoen.speeldagen;
      const users = await UserModel.find();

      currentSeizoen.klassement = [];
    
      speeldagen.forEach(speeldag => {
        speeldag.speeldagVotes.forEach(vote => {
          const user = users.find(user => user._id.toString() === vote.user.toString());
    
          let scoreOfUser = 0;
          let heefJokerGebruikt = vote.jokerGebruikt;
    
          vote.wedstrijdVotes.forEach(wedstrijdVote => {
            const wedstrijdResult = wedstrijdVote.wedstrijd.resultaat;
            if (wedstrijdVote.vote === wedstrijdResult) {
              scoreOfUser += heefJokerGebruikt ? 2 : 1;
            }
          });
    
          const existingEntryIndex = newSeizoenKlassementEntries.findIndex(entry => entry.user.toString() === user._id.toString());
          if (existingEntryIndex !== -1) {
            newSeizoenKlassementEntries[existingEntryIndex].score += scoreOfUser;
          } else {
            newSeizoenKlassementEntries.push({
              user: user._id,
              score: scoreOfUser,
              jokerGebruikt: heefJokerGebruikt,
              plaats: 0
            });
          }
        });
      });
    
      newSeizoenKlassementEntries.sort((a, b) => b.score - a.score);
    
      let i = 0
      for (const klassementEntry of newSeizoenKlassementEntries) {
        klassementEntry.plaats = i + 1;
        const createdEntry = await klassementEntryModel.create(klassementEntry);
        currentSeizoen.klassement.push(createdEntry._id);
        await createdEntry.save();
        i++;
      }
      
      await currentSeizoen.save();
    
    } catch (error) {
      console.log(error.message);
    }
  }