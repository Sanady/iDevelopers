const express = require("express");
const { check, validationResult } = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

//@route    GET api/auth
//@desc     Authenticate user & get token
//@access   Public
router.post('/', [
    check('email', 'Please include a valid email!').isEmail(),
    check('password', 'Password is required!').exists()
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [{ mesg: 'Invalid credentials!' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ errors: [{ mesg: 'Invalid credentials!' }] });
        }

        const payload = {
            user: {
                id: user.id

            }
        };

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            });


    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
