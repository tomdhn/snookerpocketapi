const joi = require('joi');
const mongoose = require('mongoose');

const speeldagSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user'
    },
    jokerGebruikt: {
        type: Boolean
    },
    SchiftingsvraagAntwoord: {
        type: Number
    },
    wedstrijdVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wedstrijdVotes'
    }]
});

const speeldagVoteModel = mongoose.model('speeldagVote', speeldagSchema);

const validateSpeeldagVotes = (speeldagVotes) => {
    const schema = joi.object({
        user: joi.string().hex().length(24),
        jokerGebruikt: joi.bool(),
        SchiftingsvraagAntwoord: joi.number(),
        wedstrijdVotes: joi.array()
    });
    return schema.validate(speeldagVotes);
};

exports.validateSpeeldagVotes = validateSpeeldagVotes;
exports.speeldagVoteModel = speeldagVoteModel;