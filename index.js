const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");

const User = require("./models/user");

const app = express();

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/admimPanel");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

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

app.get("/:id/edit", async (req, res) => {
 const { id } = req.params;
 const user = await User.findById(id)
 res.render('edit', {user})
})

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
  try {
    const validatePswrd = await bcrypt.compare(password, user.password);
    if(validatePswrd){
        req.session.user_id = user._id;
        res.redirect('/peoples')
      } else {
        res.redirect('login')
      }
  } catch (error) {
    res.redirect('login')
  }
  
});

app.post('/', (req, res) => {
    req.session.user_id = null;
    res.redirect("/")
})

// put methods
app.put('/:id/edit', async(req, res) =>{
    const {id} = req.params;
    console.log(req.body)
    const user = await User.findByIdAndUpdate(id, {...req.body.user})
    await user.save()
    res.redirect(`/${user._id}/edit`)
})

app.listen(3000, () => {
  console.log("listening on port 3000");
});
