const dotenv = require('dotenv');
const express = require('express');
const expressSanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();

dotenv.config({path: './.env'});
require('./db/conn');
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(expressSanitizer());
app.use(cookieParser());
app.use(session({
    secret:'geeksforgeeks',
    saveUninitialized: true,
    resave: true,
    cookie: { secure: true }
}));
  

app.use(flash());
const sessionFlash = function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
}
app.use(function(req,res,next){
	res.locals.error= req.flash("error");
	res.locals.success= req.flash("success");
	next();
})
app.use(sessionFlash);


app.use(require('./router/userAuth'));
app.use(require('./router/hotelAuth'));
app.use(require('./router/commentAuth'));



app.listen(PORT, () => {
    console.log(`server running at port no. ${PORT}`);
});

