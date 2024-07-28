const express = require("express");
const router = express.Router();

const User = require("../models/userModel");
const Product = require("../models/productModel");
const Bid = require("../models/bidModel");
// ensures that only authenticated users can access certain routes
const { checkAuth } = require("../middlewares/checkauth");

// Defining a POST route for placing a bid on a product
router.post("/product/:productid/bid/:userid", checkAuth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.productid).populate("bids"); //urlparam
    let owner = await User.findById(req.params.userid);
    let price = req.body.price;
    // Creates a new Bid object with the provided price, owner, and product
    let bid = new Bid({ price, owner, product });
    // Checks if there are already bids on the product
    if (product.bids.length != 0) {
      await bid.save();
      await product.bids.push(bid);
      await product.save();
      let max = 0,
        maxId;
      for (bid of product.bids) {
        if (bid.price > max) {
          max = bid.price;
          maxId = bid._id;
        }
      }
      product.highBidPrice = max;
      let bid2 = await Bid.findById(maxId);
      product.highestBid = bid2;
      await product.save();
    } else {
      product.highBidPrice = bid.price;
      product.highestBid = bid;
      await product.save();
      await bid.save();
      product.bids.push(bid);
      await product.save();
    }
    //console.log(product.highestBid.owner);
    //let highestBidOwner = await User.findById(product.highestBid.owner);
    //console.log(highestBidOwner.email);

    req.flash("success_msg", "Your Bid has been added!");
    res.redirect("back");
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/dashboard");
  }
});

module.exports = router;
