const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//middleware//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//set ejs as a template engine//
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

//create new url post//
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
  console.log(`302 Found`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  console.log(`200 Ok`);
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
  console.log(`200 Ok`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// login with username//
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
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

app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
