const express = require('express');
const router = express.Router();
const User = require('../models/user');
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');




//bij het testen van deze klasses in postman vergeet niet POST aan te zetten!!!!

router.post('/login', async (req, res, next) => {

    try {
        const { email, password } = req.body;

        const user = await User.UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        // const passwordMatch = await bcrypt.compare(password, user.password);
        // console.log("pw: " + password + " userpw: " + user.password)
        // console.log(passwordMatch)
        if (password !== user.password) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({ userId: user._id, isAdmin: user.admin }, config.get('jwtPrivateKey'), {
            expiresIn: '365d', 
        });
        res.cookie("token",token, {
            withCredentials: true,
            httpOnly: false,
        });
        res.status(200).json({success: true, user: user, token: token});
        next()
    }
    catch (error) {
        res.status(400).json({
            message: "An error occurred",
            error: error.message,
        })
    }

});


module.exports = router;