const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

//create randomstring for password and url//
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//middleware//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//set ejs as a template engine//
app.set("view engine", "ejs");

//Database//
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const user = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Home page//
app.get("/", (req, res) => {
  res.send("Hello!");
});

// url page//
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    urls: urlDatabase,
    user: user[userId],
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
  console.log(`302 Found`);
});

//create new URL page//
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    user: user[userId],
  };
  console.log(`200 Ok`);
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//single URL details page//
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user[userId],
  };
  res.render("urls_show", templateVars);
  console.log(`200 Ok`);
});

// logout and clear the username//
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//Delete single URL//
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(`Delete the item`);
  res.redirect("/urls");
});

//Url page jumping to dinamic signle page with edit button//
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//Dinamic page editing with submit button//
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;

  res.redirect("/urls");
});

// login with username//
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// registraion  page//
app.get("/register", (req, res) => {
  res.render("registration");
});

const checkEmail = (newEmail) => {
  for (const id in user) {
    if (user[id].email !== newEmail) {
      return newEmail;
    }
    return false;
  }
};
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  const validEmail = checkEmail(email);

  if (email === "" || password === "") {
    console.log(`Email of password is empty`);
    res.statusCode = 400;
    res.write("400 Email or password can't be empty");
    res.end();
  } else if (!validEmail) {
    console.log(`The email address is invalid`);
    res.statusCode = 400;
    res.write("The email address is invalid");
    // res.redirect("/register");
    res.end();
  } else {
    checkEmail(email);
    user[userId] = {
      id: userId,
      email,
      password,
    };
    console.log(`registered new user`);
    res.cookie("user_id", user[userId]["id"]);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
