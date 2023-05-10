const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");

const User = require("./models/user");

const app = express();

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/admimPanel");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

//  all the get request and render the ejs pages
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/peoples", async (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const users = await User.find({});
  const who = await User.findById( req.session.user_id )
  const role = who.role;
  res.render("peoples", {users, role, who});
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

// all the post requests
app.post("/register", async (req, res) => {
  const { username, password, usertype } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
    role: usertype,
  });
  await user.save();
  console.log(user);
  req.session.user_id = user._id;
  res.redirect("/peoples");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const validatePswrd = await bcrypt.compare(password, user.password);
  if(validatePswrd){
    req.session.user_id = user._id;
    res.redirect('/peoples')
  } else {
    res.redirect('login')
  }
});

app.post('/', (req, res) => {
    req.session.user_id = null;
    res.redirect("/")
})

app.listen(3000, () => {
  console.log("listening on port 3000");
});
