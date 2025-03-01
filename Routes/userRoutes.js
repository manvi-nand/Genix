// file defines routes related to user-specific actions, 
//such as viewing profiles, sorting products, and searching for products

const express = require("express");
const router = express.Router();

//required models
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Bid = require("../models/bidModel");
const { checkAuth } = require("../middlewares/checkauth");


// Defines a GET route to display the user's profile
router.get("/me/profile", checkAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user_id).populate(
      "products"
    );
    // to show the bits a user has made
    const allBids = await Bid.find({ owner: currentUser._id }).populate(
      "product"
    );
    res.render("userViews/profile", { currentUser, req, allBids });
  } 
  catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/dashboard");
  }
});


// Defines a GET route to display products in alphabetical order on the dashboard
router.get("/dashboard/alpha", checkAuth, async (req, res) => {
  try {
    const products = await Product.find({})
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 })
      .populate("owner")
      .populate({
        path: "highestBid",
        populate: {
          path: "owner",
        },
      });
    const alpha = 1;
    const currentUser = await User.findById(req.session.user_id);
    res.render("productViews/dashboard", { products, currentUser, alpha, req });
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/dashboard");
  }
});

router.post("/sort", async (req, res) => {
  try {
    if (req.body.sort == "highestbid") {
      res.redirect("/dashboard");
    }
    if (req.body.sort == "alpha") {
      res.redirect("/dashboard/alpha");
    }
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/dashboard");
  }
});


// Searching for Products
router.post("/search", async (req, res) => {
  try {
    const searchOption = req.body.searchoption;
    if (searchOption == "Search by tag") {
      const tag = req.body.tag;
      const products = await Product.find({ tag })
        .populate({
          path: "bids",
          populate: {
            path: "owner",
          },
        })
        .populate("owner")
        .populate({
          path: "highestBid",
          populate: {
            path: "owner",
          },
        })
        
      res.render("productViews/tagsearch", { products, tag, req });
    }
    if (searchOption == "Search by name") {
      const name = req.body.product;
      if (name != "") {
        const products = await Product.find({ name: new RegExp(name, "i") })
          .populate({
            path: "bids",
            populate: {
              path: "owner",
            },
          })
          .populate("owner")
          .populate({
            path: "highestBid",
            populate: {
              path: "owner",
            },
          })
        
        res.render("productViews/namesearch", { products, name, req });
      } else {
        req.flash("error_msg", "Please enter something to search!");
        res.redirect("/dashboard");
      }
    }
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/dashboard");
  }
});

module.exports = router;
