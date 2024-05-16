const {speeldagVoteModel} = require("../models/speeldagVote");

module.exports = async function getSpeeldagVote(req, res, next)  {
    let speeldagVote;
    try{
      speeldagVote = await speeldagVoteModel.findById(req.params.id);
      if (speeldagVote == null){
        console.log("speeldagVote niet gevonden");
      }
    }catch (error){
      console.log(error);
    }
    res.speeldagVote = speeldagVote;
    next();
  }