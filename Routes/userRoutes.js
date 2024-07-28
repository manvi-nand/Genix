const express = require("express");
const router = express.Router();

//require models
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Bid = require("../models/bidModel");
//const Review = require("../models/reviewModel");
const { checkAuth } = require("../middlewares/checkauth");

router.get("/me/profile", checkAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user_id).populate(
      "products"
    );
    // to show the bits a user has made
    const allBids = await Bid.find({ owner: currentUser._id }).populate(
      "product"
    );

    // if(allBids.length > 0) {
    //   //console.log(allBids);
    //   let bidIds = []
    //   for(let i=0;i<allBids.length;i++) {
    //     bidIds = allBids[i].product._id;
    //   }

    //   for(let i=0;i<bidIds.length;i++) {
    //     await Bid.findByIdAndDelete(bidIds[i]);
    //   }

      
    // }

    // for (let i = 0; i < allBids.length; i++) {
    //   console.log(allBids[i].product.startPrice);
    // }

    res.render("userViews/profile", { currentUser, req, allBids });
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/dashboard");
  }
});

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
        // .populate({
        //   path: "reviews",
        //   populate: {
        //     path: "user",
        //   },
        // });
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
        //   .populate({
        //     path: "reviews",
        //     populate: {
        //       path: "user",
        //     },
        //   });
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
