const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Bid = require("../models/bidModel");
//const Review = require("../models/reviewModel");
const path = require("path");
const fs = require("fs");
const { checkAuth } = require("../middlewares/checkauth");
// multer is used for handling file uploads
const multer = require("multer");

const storage = multer.diskStorage({
  // Specifies the directory where uploaded files will be stored
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    // defines how the filename of the uploaded file will be constructed
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { filesize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error : Images only");
  }
}

// helper function that associates a newly created product with the current user 
const saveProduct = async (product, user_id) => {
  const currentUser = await User.findById(user_id);
  currentUser.products = await currentUser.products.concat(product._id);
  await currentUser.save();
};

// Renders a form to create a new product
router.get("/newproduct", checkAuth, (req, res) => {
  res.render("productViews/newproduct", { req }); //req - every ejs file has req.session.userid to see if the user is present
});

router.post("/newproduct", checkAuth, async (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err) {
        res.send("error");
        console.log(err);
      } else {
        const name = req.body.name;
        const description = req.body.description;
        const startPrice = req.body.startPrice;
        const tag = req.body.tag;
        const owner = req.session.user_id;
        const highBidPrice = startPrice;
        const bidDeadline = req.body.deadline;
        // Creates a new Product instance with the provided data and uploaded image.
        const product = new Product({
          name,
          description,
          startPrice,
          tag,
          owner,
          highBidPrice,
          bidDeadline,
          image: {
            data: fs.readFileSync(
              path.join("./public/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        });
        product.save();
        saveProduct(product, req.session.user_id);
        req.flash("success_msg", "Successfully saved your product!");
        res.redirect(`/product/${product._id}/show`);
      }
    });
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Couldn't save your product! Try again!");
    res.redirect("/dashboard");
  }
});


// This route is used to render a dashboard view with product listings
router.get("/dashboard", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-highBidPrice")
      .populate("owner")
      .populate({
        path: "highestBid",
        populate: {
          path: "owner",
        },
      });
    const alpha = 0;

    res.render("productViews/dashboard", { products, req, alpha });
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong, Try again!");
    res.redirect("/login");
  }
});

// displays detailed information about a specific product
router.get("/product/:id/show", checkAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
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
      });
    
    // Retrieves the User document for the currently logged-in user based on the user_id stored in the session
    const currentUser = await User.findById(req.session.user_id);

    let now = Date.now();
    let deadline = new Date(product.bidDeadline);
    if (now >= deadline) {
      product.canBid = false;
      await product.save();
    }

    if (product.owner.username == currentUser.username) {
      res.render("productViews/ownerproductshow", {
        product,
        req,
        currentUser,
      });
    } else {
      res.render("productViews/userproductshow", { product, req, currentUser });
    }
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong! Try again!");
    res.redirect("/dashboard");
  }
});


/// operations that the user can perform on their product //

// update the product
router.get("/product/:id/update", checkAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); //url 
    res.render("productViews/updateproduct", { product, req });
  } 
  catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong! Try again!");
    res.redirect("/dashboard");
  }
});

router.put("/product/:id/update", checkAuth, async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const product = await Product.findByIdAndUpdate(req.params.id, {
      name,
      description,
    });
    req.flash("success_msg", "Successfully updated your product!");
    res.redirect(`/product/${req.params.id}/show`);
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong! Try again!");
    res.redirect("/dashboard");
  }
});


// delete a product
router.get("/product/:id/delete", checkAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("owner");
    const owner = await User.findById(product.owner._id);
    const index = await owner.products.indexOf(product._id);
    const allBids = await Bid.find({ product: product._id });
    //console.log(allBids);
    let bidIds = [];
    // if that product is deleted every bit for that prod should be deleted
    for (let i = 0; i < allBids.length; i++) {
      bidIds.push(allBids[i]);
    }

    for (let i = 0; i < bidIds.length; i++) {
      await Bid.findByIdAndDelete(bidIds[i]);
    }

    await owner.products.splice(index, 1);
    await owner.save();
    await Product.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Your product is deleted!");
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong! Try again!");
    res.redirect("/dashboard");
  }
});


// ending the bid before the deadline
router.get("/product/:id/endbid", checkAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.canBid = false;
    await product.save();
    res.redirect(`/product/${product._id}/show`);
  } 
  catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong! Try again!");
    res.redirect("/dashboard");
  }
});

module.exports = router;
