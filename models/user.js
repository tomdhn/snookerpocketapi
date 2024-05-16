const joi = require('joi');
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    betaald: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        required: true,
        min: 1,
        max: 100,
        unique: true
    },
    email: {
        type: String,
        required: true,
        min: 1,
        max: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 1,
        max: 100
    }
});

const UserModel = mongoose.model('user', UserSchema);

const validateUser = (users) => {
    const schema = joi.object({
        admin: joi.bool().required(),
        betaald: joi.bool().default(false),
        username: joi.string().min(1).max(100).required(),
        email: joi.string().min(1).max(100).required().email(),
        password: joi.string().min(1).max(100).required(),
    });
    return schema.validate(users);
}

exports.validateUser = validateUser;
exports.UserModel = UserModel; 