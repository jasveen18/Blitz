const express = require('express');
const router = express.Router();
const multer = require('multer');
require('../db/conn');
const Hotels = require('../model/hotelSchema');
const Comments = require('../model/commentSchema');
const cloudinary = require('../utils/Cloudinary');
const authenticate = require('../middlewares/authenticate');


const storage = multer.diskStorage({
    filename: function(req,file,callback){
        callback(null, Date.now()+file.originalname);
    }
});

const imageFilter = function(req,file,cb){
    //accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)){
        return cb(new Error('Only image files are allowed'),false);
    }
    cb(null,true);
};

const upload = multer({ storage:storage, fileFilter: imageFilter});



//search hotels
router.get('/hotels', async(req,res) => {

    try{
    
        if(req.query.search){
            const find = req.query.search;
            //console.log(find);
            const hotels = await Hotels.find({ 
                $or : [
                    {name:{$regex:find, $options:'$i'}},
                    {place:{$regex:find, $options:'$i'}}
                ]
            });
            //console.log(hotels);
            //console.log(hotels.length);
            var noMatch;
            if(hotels.length > 0){
                var noMatch =" All food stalls that matches with : "+ req.query.search;
				res.render("hotels/home",{hotels:hotels, noMatch:noMatch});
            }
            else
            {
                
                noMatch = "We did not found any food stall that match with " + req.query.search + " but here are all our food stalls: ";
                //console.log(noMatch);
                const allHotels = await Hotels.find({});
                //console.log(allHotels);

                if(!allHotels){
                    res.status(404).json({error: 'hotels not found'});
                }
                else
                {
                    res.render('hotels/home',{hotels:allHotels, noMatch: noMatch});
                }   
            }          
        }
        else
        {
            var noMatch;
            const hotels = await Hotels.find({});
            if(!hotels){
                res.status(422).json({error: 'hotels not found'});
            }
            else
            {
                res.render('hotels/home', {hotels:hotels, noMatch:noMatch});
            }
        }
    }catch(err){
        console.log('error in find hotels', err);
    }  
    
});



//create new hotel
router.post('/hotels', authenticate, upload.single('image'), async(req,res) => {
    
    cloudinary.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          console.log(err)
          req.flash('error', err.message);
          return res.redirect('back');
        }
        req.body.image = result.secure_url;
        req.body.imageId = result.public_id;


  
    var name= req.body.name;
    var image=req.body.image;
    var imageId= req.body.imageId;
    var description=req.body.description;
    var address= req.body.address;
    var place= req.body.place;
    var author = { 
	 	id: req.rootUser._id,
	 	username:req.rootUser.username,
	}
      var newHotel= {name:name, image: image, imageId:imageId, description:description, place:place, author:author, address:address};
      
    Hotels.create(newHotel,function(err,newlyCreated){
             if(err){
              req.flash("error", "Something went wrong")
              res.redirect("/hotels");
              console.log(err);
          }
          else{
              res.redirect("/hotels");
          }
    });
  });
  
});



//new hotel
router.get('/hotels/new', authenticate, (req,res) => {
    res.render('hotels/new');
});


//edit hotels
// router.get('/hotels/:id/edit', authenticate, async(req,res) => {
//     try{
//         const foundHotel = await Hotels.findById(req.params.id);

//         if(!foundHotel){
//             req.flash("error", "Hotel not found");
//             res.redirect('/hotels');
//         }
//         else
//         {
//             res.render('hotels/edit', {hotel:foundHotel});
//         }
//     }catch(err){
//         console.log('Error in edit hotel', err);
//     }
// });



//update your hotel
// router.put('/hotels/:id', authenticate, upload.single('image'), async(req,res) => {

//     try{

//         const myHotel = await Hotels.findById(req.params.id);
        
//         if(myHotel){

//             if(req.file){
//                 cloudinary.uploader.destroy(myHotel.imageId);
//                 const newResult = cloudinary.uploader.upload(req.file.path);
//                 if(!newResult){
//                     return res.redirect('back');
//                 }
//                 else
//                 {
//                     req.body.image = newResult.secure_url;
// 				    req.body.imageId = newResult.public_id;
// 				    myHotel.image= req.body.image;
// 				    myHotel.imageId= req.body.imageId;
// 				    myHotel.save();
//                 }
//             }

//             myHotel.name = req.body.name;
//             myHotel.description = req.body.description;
// 			myHotel.place=req.body.place;
// 			myHotel.address= req.body.address;
//             myHotel.save();
//             req.flash("success","Successfully Updated!");
//             res.redirect("/hotels/" + hotel._id);       
//         }

//     }catch(err){
//         console.log('Error in update hotel', err);
//     }

// });



//show hotel
router.get('/hotels/:id', (req,res) => {
    Hotels.findById(req.params.id).populate({path: 'comments', model: Comments}).exec(function(err, foundHotel){
        if(err){
            console.log(err);
        } else {
            res.render("hotels/show", {hotel: foundHotel});
            //console.log(foundHotel);
        }
    })

});



//delete my hotel
router.delete('/hotels/:id', authenticate, (req,res) => {
    Hotels.findById(req.params.id, (err,foundHotelDel) => {
        if(err){
            console.log(err);
        }
        else{
            cloudinary.uploader.destroy(foundHotelDel.imageId);
            foundHotelDel.comments.forEach((curr) => {
                Comments.findByIdAndRemove(curr, (err) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log('Comments Deleted');
                    }
                })
            })
        }
    });

    Hotels.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect('/hotels');
        }
        else{
            res.redirect('/hotels');
        }
    });

});



module.exports=router;
