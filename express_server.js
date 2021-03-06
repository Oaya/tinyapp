const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  checkAuthentication,
  addUser,
} = require("./helper");

//Middleware//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["This chocolatechip cookies are great", "I cannot stop eating"],
  })
);

//Set ejs as a template engine//
app.set("view engine", "ejs");

//Database//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
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

//Landing Page//
app.get("/", (req, res) => {
  const userId = req.session.user_id;

  if (userId !== undefined) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

//Url page//
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = {
    urls,
    user: users[userId],
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const visitedTime = 0;
  if (!userID) {
    res.write("Only logged in user able to add new url");
    res.end();
  }
  urlDatabase[shortURL] = {
    longURL,
    userID,
    visitedTime,
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// Create new URL page//
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  const templateVars = {
    user: users[userId],
  };

  if (!userId) {
    return res.redirect("/urls");
  }
  res.render("urls_new", templateVars);
});

//Dinamic page editing with submit button//
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const { longURL, userID, visitedTime } = urlDatabase[shortURL];
  console.log(urlDatabase);
  if (!userId) {
    res.write("User should login first");
    res.end();
  }
  const templateVars = {
    shortURL,
    longURL,
    userID,
    user: users[userId],
    visitedTime,
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.redirect("/login");
  }
  urlDatabase[req.params.id] = { longURL: req.body.newURL, userID: userId };

  res.redirect("/urls");
});

//Delete single URL//
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  if (!userId) {
    res.write("user should login first");
    res.end();
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Url page jumping to dinamic signle page with edit button//
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

//Jmup to the id page//
app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];

  if (url?.longURL) {
    url.visitedTime += 1;

    return res.redirect(url.longURL);
  }

  res.status(400).send(`the id URL doesn't exit.`);
});

//Login with Email and password//
app.get("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const { error, data } = checkAuthentication(email, password, users);
  if (error) {
    res.status(403).send(`${error}`);
  } else {
    req.session.user_id = data;
    res.redirect("/urls");
  }
});

// Registraion  page//
app.get("/register", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const { error, data } = addUser(email, password, users);
  if (error) {
    console.log(error);
    res.status(403).send(`${error}`);
  } else {
    req.session.user_id = data;
    res.redirect("/urls");
  }
});

//Logout and clear the user_id for session//
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
