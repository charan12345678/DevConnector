const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check , validationResult } = require('express-validator');


// @route GET api/auth
// @desc auth route
// @access Public fdgdfgfdfgfdfg

router.get('/',auth,async(req,res)=> {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
});

// @route POSTT api/auth
// @desc Authenticate user & get token
// @access Public

router.post('/',[
    check('password','Password is required').exists(),
    check('email','Please enter a valid email').isEmail(),
], async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password } = req.body;

    try {
    //See if user exists 
    let user = await User.findOne({email});

    if(!user){
       return res.status(400).json({errors: [{msg : 'Invalid credentials'}] });
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({errors: [{msg : 'Invalid Credentials'}]});
    }

    //Return jasonwebtoken  
    const payload = {
        user: {
            id:user.id
        }
    }
    jwt.sign(payload,
        config.get('jwtSecret'),
        {
            expiresIn :360000
        },(err,token) => {
        if (err) throw err; 
        res.json({ token });
    });

   
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
        
    }  

});

module.exports =router;