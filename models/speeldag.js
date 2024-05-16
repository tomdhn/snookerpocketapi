const joi = require('joi');
const mongoose = require('mongoose');

const speeldagenSchema = new mongoose.Schema({
    schiftingsvraag: {
        type: String,
        required: true
    },
    schiftingsantwoord: {
        type: Number,
        required: true
    },
    wedstrijden: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wedstrijd'
    }],
    speeldagVotes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'speeldagVote'
    }],
    klassement: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "klassementEntry"
    }],
    startDatum: {
        type: Date,
        required: true
    },
    eindDatum: {
        type: Date,
        required: true
    }
});

// speeldagenSchema.virtual("parentId").get(function() {
//     return this.ownerDocument().id;
//   });

const speeldagenModel = mongoose.model('speeldagen', speeldagenSchema);

const validateSpeeldag = (speeldag) => {
    const schema = joi.object({
        schiftingsvraag: joi.string().required(),
        schiftingsantwoord: joi.number().required(),
        wedstrijden: joi.array().items(joi.string().hex().length(24)),
        speeldagVotes: joi.array().items(joi.string().hex().length(24)),
        klassement: joi.array().items(joi.string().hex().length(24)),
        startDatum: joi.date().required(),
        eindDatum: joi.date().required()
    });
    return schema.validate(speeldag);
};


exports.validateSpeeldag = validateSpeeldag;
exports.speeldagenModel = speeldagenModel;
