const joi = require('joi');
const mongoose = require('mongoose');

// resultaten: 1 = thuis, X = gelijk, 2 = uit, 0 = niet gestemd
const resultaat = ["1", "X", "2", "0"];

const wedstrijdSchema = new mongoose.Schema({
    datum: {
        type: Date,
        required: true
    },
    resultaat: {
        type: String,
        enum: resultaat,
        default: "0"
    },
    thuis: {
        type: String,
        required: true
        
    },
    uit: {
        type: String,
        required: true
    }
});

const wedstrijdModel = mongoose.model("wedstrijd", wedstrijdSchema);

const validateWedstrijd = (wedstrijden) => {
    const schema = joi.object({
        datum: joi.date().required(),
        resultaat: joi.string().valid(...resultaat),
        thuis: joi.string().required(),
        uit: joi.string().required()
    });
    return schema.validate(wedstrijden);
}

exports.validateWedstrijd = validateWedstrijd;
exports.wedstrijdModel = wedstrijdModel;