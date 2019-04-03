var express = require("express");
var router  = express.Router();
var Destination = require("../models/destination");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var { isLoggedIn, checkUserDestination, checkUserComment, isAdmin, isSafe } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all destination
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all destination from DB
      Destination.find({name: regex}, function(err, allDestination){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allDestination);
         }
      });
  } else {
      // Get all destination from DB
      Destination.find({}, function(err, allDestination){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allDestination);
            } else {
              res.render("destination/index",{destination: allDestination, page: 'destination'});
            }
         }
      });
  }
});

//CREATE - add new destination to DB
router.post("/", isLoggedIn, isSafe, function(req, res){
  // get data from form and add to destination array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || data.status === 'ZERO_RESULTS') {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newDestination = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new destination and save to DB
    Destination.create(newDestination, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to destination page
            console.log(newlyCreated);
            res.redirect("/destination");
        }
    });
  });
});

//NEW - show form to create new destination
router.get("/new", isLoggedIn, function(req, res){
   res.render("destination/new"); 
});

// SHOW - shows more info about one destination
router.get("/:id", function(req, res){
    //find the destination with provided ID
    Destination.findById(req.params.id).populate("comments").exec(function(err, foundDestination){
        if(err || !foundDestination){
            console.log(err);
            req.flash('error', 'Sorry, that destination does not exist!');
            return res.redirect('/destination');
        }
        console.log(foundDestination)
        //render show template with that destination
        res.render("destination/show", {destination: foundDestination});
    });
});

// EDIT - shows edit form for a destination
router.get("/:id/edit", isLoggedIn, checkUserDestination, function(req, res){
  //render edit template with that destination
  res.render("destination/edit", {destination: req.destination});
});

// PUT - updates destination in the database
router.put("/:id", isSafe, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Destination.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, destination){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/destination/" + destination._id);
        }
    });
  });
});

// DELETE - removes destination and its comments from the database
router.delete("/:id", isLoggedIn, checkUserDestination, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.destination.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.destination.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Destination deleted!');
            res.redirect('/destination');
          });
      }
    })
});

module.exports = router;

