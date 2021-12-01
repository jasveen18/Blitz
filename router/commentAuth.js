const express = require('express');
const router = express.Router({mergeParams:true});
require('../db/conn');
const Hotels = require('../model/hotelSchema');
const Comments = require('../model/commentSchema');
const authenticate = require('../middlewares/authenticate');


//new comment
router.get('/hotels/:id/comments/new', authenticate, (req,res) => {
    Hotels.findById(req.params.id, (err,hotel) => {
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect('back');
        }
        else{
            res.render('comments/new', {hotel:hotel});
        }
    });

});



//post new comment
router.post('/hotels/:id/comments', authenticate, (req,res) => {
    Hotels.findById(req.params.id, (err,hotel) => {
        if(err){
            console.log(err);
            req.flash("error","Hotel not found");
            res.redirect('/hotels');
        }
        else{
            Comments.create(req.body.comment, (err,comment) => {
                if(err){
                    console.log(err);
                }
                else{
                    comment.author.id = req.rootUser._id;
                    comment.author.username = req.rootUser.username;
                    comment.hotelId = req.params.id;
					comment.hotelName = hotel.name;
					comment.save();
                    //console.log(comment);
					hotel.comments.push(comment);
					hotel.save();
                    req.flash("success", "You made a new comment"); 
					res.redirect("/hotels/"+hotel._id);
                }
            });

        }

    });

});



//get edit comment
router.get('/hotels/:id/comments/:comment_id/edit', authenticate, (req,res) => {
    var hotel_id = req.params.id;
    Comments.findById(req.params.comment_id, (err,foundComment) => {
        if(err){
            req.flash("error", "Something went wrong");
			res.redirect("back");
		}else{
			res.render("comments/edit",{hotel_id: req.params.id, comment: foundComment });
		}
    });

});



//update comment
router.put('/hotels/:id/comments/:comment_id', authenticate, (req,res) => {
    Comments.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err,updatedComment) => {
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect('back');
        }
        else{
            req.flash("success", "Comment succesfully updated");
            res.redirect('/hotels/' + req.params.id);
        }
    });

});



//delete comment
router.delete("/hotels/:id/comments/:comment_id", authenticate, (req,res) => {
	Comments.findById(req.params.comment_id, (err,foundComment) => {
		if(err){
            req.flash("error", "Something went wrong");
			res.redirect("back");
		}
        else{
			Hotels.findById(foundComment.hotelId, (err,foundHotel) => {
				if(err){
                    req.flash("error", "Something went wrong");
				    res.redirect("back");
				}
                else{	
					foundHotel.comments.splice(foundHotel.comments.indexOf(req.params.comment_id),1);
					foundHotel.save();
						Comments.findByIdAndRemove(req.params.comment_id, (err) => {
								if(err){
                                    req.flash("error", "Something went wrong");
									res.redirect("back");
								}
                                else{
                                    req.flash("success", "Comment succesfully deleted");
									res.redirect("/hotels/" + req.params.id);
								}

							});
				}
			});
		}
		
	});

});


module.exports = router;
