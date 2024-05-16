const joi = require('joi');
const mongoose = require('mongoose');

const resultaat = ["1", "x", "2", "0"];

const wedtrijdVotesSchema = new mongoose.Schema({
    vote:{
        type: String,
        default: "0",
        enum: resultaat
    },
    wedstrijd: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wedstrijd',
        required: true
    }
});

const wedstrijdVotesModel = mongoose.model('wedstrijdVotes', wedtrijdVotesSchema);

const validateVote = (vote) => {
    const schema = joi.object({
        vote: joi.string().valid(...resultaat).required(),
        wedstrijd: joi.string().hex().length(24).required()
    });
    return schema.validate(vote);
}

exports.validateVote = validateVote;
exports.wedstrijdVotesModel = wedstrijdVotesModel;
