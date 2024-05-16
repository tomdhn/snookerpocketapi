const { seizoenModel } = require('../models/seizoen');

module.exports = async function getSeizoen(req, res, next)  {
    let seizoen;
    try{
      seizoen = await seizoenModel.findById(req.params.id);
      if (seizoen == null){
        console.log("seizoen niet gevonden");
      }
    }catch (error){
      console.log(error);
    }
    res.seizoen = seizoen;
    next();
  }