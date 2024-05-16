const joi = require('joi');
const mongoose = require('mongoose');

const klassementEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    },
    score: {
        type: Number,
        require: true,
        default: 0
    },
    plaats: {
        type: Number,
        require: true
    }, 
    jokerGebruikt: {
        type: Boolean,
        default: false,
        require: false
    }
});

const klassementEntryModel = mongoose.model('klassementEntry', klassementEntrySchema);

const validateKlassementEntry = (klassementEntry) => {
    const schema = {
        user: joi.string().hex().length(24),
        score: joi.number().required(),
        plaats: joi.number().required(),
        jokerGebruikt: joi.boolean()
    };
    return joi.validate(klassementEntry, schema);
}

exports.validateKlassementEntry = validateKlassementEntry;
exports.klassementEntryModel = klassementEntryModel;