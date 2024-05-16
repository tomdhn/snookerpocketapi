const joi = require("joi");
const mongoose = require("mongoose");

const seizoenSchema = new mongoose.Schema({
  name: {
    type: String,
    default: function() {
      const currentYear = new Date().getFullYear();
      return `Seizoen ${currentYear}-${currentYear + 1}`;
    },
    unique: true,
  },
  bevriesKlassement: {
    type: Boolean,
    default: false,
  },
  klassement: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "klassementEntry"
  }],
  speeldagen: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "speeldagen"
  }],
  startdatum: {
    type: Date,
    default: Date.now,
  },
  seizoenBeeindigd: {
    type: Boolean,
    default: false,
  },
  aantalJokers: {
    type: Number,
    default: 4
  }
});

const seizoenModel = mongoose.model("seizoen", seizoenSchema);

const validateSeizoen = (seizoen) => {
  const schema = joi.object({
     name: joi.string().min(5).max(255),
     bevriesKlassement: joi.boolean(),
     klassement: joi.array().items(joi.string().hex().length(24)),
     speeldagen: joi.array().items(joi.string().hex().length(24)),
     startdatum: joi.date(),
     seizoenBeeindigd: joi.boolean(),
     aantalJokers: joi.number()
  });
  return schema.validate(seizoen);
};

exports.validateSeizoen = validateSeizoen;
exports.seizoenModel = seizoenModel;
