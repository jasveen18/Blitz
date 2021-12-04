const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('../db/conn');
const User = require('../model/userSchema');
const authenticate = require('../middlewares/authenticate');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//home
router.get('/', (req,res) => {
    res.render('home');
});


//show register form
router.get('/register', (req,res) => {
    res.render('register');
});


// user registration
router.post('/register', async(req,res) => {
    
    const { username, name, email, password, confirm_password } = (req.body);

    if(!username || !name || !email || !password || !confirm_password ){
        req.flash("error", 'please fill the details properly');
        res.redirect("/register");
    }

    try{

        const emailExist = await User.findOne({email:email});
        const usernameExist = await User.findOne({username:username});

        if(emailExist){
            return res.status(422).json({error:'email already exist'});
        }
        else if(usernameExist){
            return res.status(422).json({error:'username already exist'});
        }
        else if(password != confirm_password){
            return res.status(422).json({error:'password is not matching'});
        }
        else if(password.length<6){
            return res.status(422).json({error:'password length should be minimum of 6'});
        }
        else
        {
            const user = new User({username,name,email,password,confirm_password});
            //pre function called
            const userRegister = await user.save();

            if(userRegister){
                req.flash('success', 'Welcome to Blitz ' + username );
                res.redirect('/hotels');
            }
            else
            {
              req.flash("error", 'failed to register, try again');
              res.redirect("/register");
            }
        }


    }catch(err){
      req.flash("error", err.message);
      res.redirect("/register");
    }

});


//show login page
router.get('/login', (req,res) => {
    res.render('login');
});


//user login
router.post('/login', async(req,res) => {

    try{
        const { username,password } = req.body;

        if(!username || !password){
            return res.status(400).json({error:'please fill the details'});
        }

        const userLogin = await User.findOne({username:username});

        if(userLogin){
            const isMatch = await bcrypt.compare(password,userLogin.password);

            const tokken = await userLogin.generateAuthToken();

            res.cookie('jwtoken', tokken , {
                expire:new Date(Date.now()+25892000000),
                httpOnly:true
            });

            if(!isMatch){
                res.status(400).json({error:'invalid credientials'});
            }
            else
            {
                //res.status(200).json({message:'user login successfull'});
                res.redirect('/hotels');
            }
        }
        else
        {
            res.status(400).json({error:'invalid credientials'});
        }
        
    }catch(err){
        console.log('error in login',err);
    }

});



//logout
router.get('/logout', (req,res) => {
  res.clearCookie('jwtoken', {path:'/hotels'});
  res.redirect('/');
});



//about us page
router.get('/about', (req,res) => {
  res.render('about');
});





//show contact page
router.get('/contact', authenticate, (req,res) => {
    res.render('contact');
});  


//contact
router.post('/contact', authenticate, async (req,res) => {
    const {name, email, message} = req.body;
    //name=req.sanitize(name);
    //email=req.sanitize(email);
    //message=req.sanitize(message);

    const msg = {
        to: 'jasveens129@gmail.com',
        from: 'jasveens129@gmail.com',
        subject: 'From Blitz by'+ name + " : " + email,
        text: message,
        html: message,
    };

    try {
        await sgMail.send(msg);
        req.flash('success', 'Thank you for your email, we will get back to you shortly.');
        res.redirect('/contact');
      } catch (error) {
        console.error(error);
        if (error.response) {
          console.error(error.response.body)
        }
        req.flash('error', 'Sorry, something went wrong, please contact rubenpuerta89@gmail.com');
        res.redirect('back');
      }

});

module.exports = router;
