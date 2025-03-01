const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

//here all the route files are imported
const productRoutes = require("./Routes/productRoutes");
const userRoutes = require("./Routes/userRoutes");
const authRoutes = require("./Routes/authRoutes");
const bidRoutes = require("./Routes/bidRoutes");

// connects to the MongoDB database named 'spidertask3'
mongoose.connect("mongodb://127.0.0.1:27017/spidertask3", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true, // search
});
// sets up event listeners for the MongoDB connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// Specifies the directory where the view templates are located.
app.set("views", path.join(__dirname, "views")); 

app.use(express.urlencoded({ extended: true })); // used to parse URL-encoded data
app.use(methodOverride("_method")); // middleware allows you to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(express.static(path.join(__dirname, "public")));
//app.use(bodyParser.json()); //parses incoming requests with JSON payloads

const sessionConfig = {
  secret: "thisisasecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  // local storage in the browser
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Registers the route handlers
app.use(bidRoutes);
app.use(productRoutes);
app.use(userRoutes);
app.use(authRoutes);



app.get("/", async (req, res) => {
  res.redirect("/login");
});

// Starts the Express server on port 3000 
app.listen(3001, () => {
  console.log("Serving at port 3001");
});
