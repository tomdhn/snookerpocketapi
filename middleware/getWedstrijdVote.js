const wedstrijdVotesModel = require("../models/wedstrijdVote");

module.exports = async function getWedstrijdVote(req, res, next)  {
    let wedstrijdVote;
    try{
      wedstrijdVote = await wedstrijdVotesModel.findById(req.params.id);
      if (wedstrijdVote == null){
        console.log("wedstrijdVote niet gevonden");
      }
    }catch (error){
      console.log(error);
    }
    res.wedstrijdVote = wedstrijdVote;
    next();
  }





  // :) <3
  // everything is middleware
  // always has been