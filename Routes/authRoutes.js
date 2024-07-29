const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const Product = require("../models/productModel");

// route for the /register endpoint
router.get("/register", (req, res) => {
  // Render the registration form with any flash messages
  res.render("authViews/register", { messages: req.flash(), req });
});

// handling form submissions for user registration
router.post("/register", async (req, res) => {
  const { password, username, email, age, gender } = req.body;

  // Define validation rules
  const minPasswordLength = 8;

  // Check for password validity
  if (password.length < minPasswordLength) {
    req.flash(
      "error_msg",
      `Password must be at least ${minPasswordLength} characters long.`
    );
    return res.redirect("/register");
  }
  

  const user = await User.findOne({ username });
  if (!user) {
    const hash = await bcrypt.hash(password, 8);
    const newUser = new User({ username, password: hash, email, age, gender });
    await newUser.save();
    req.flash("success_msg", "Successfully registered, You can login now!");
    res.redirect("/login");
  } else {
    req.flash("error_msg", "Username already taken! Try again!");
    res.redirect("/register");
  }
  
});


// GET route for the /login endpoint
router.get("/login", (req, res) => {
  res.render("authViews/login");
});
// handling form submissions for user login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    req.flash("error_msg", "Incorrect username or password");
    res.redirect("/login");
  } else {
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      req.session.user_id = user._id;
      req.flash("success_msg", "Welcome to Genix Auctions");
      res.redirect("/dashboard");
    } else {
      req.flash("error_msg", "Invalid username or password");
      res.redirect("/login");
    }
  }
});

// Defining a GET route for the /logout endpoint
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/dashboard");
});

module.exports = router;
