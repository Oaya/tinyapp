const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { generateUserHelper } = require("./helper");

//create randomstring for password and url//
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//middleware//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["This chocolatechip cookies are great", "I cannot stop eating"],
  })
);

//set ejs as a template engine//
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
const { getUserByEmail, urlsForUser } = generateUserHelper(urlDatabase);

//Landing Page//
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Url page//
app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const urls = urlsForUser(userId);

  const templateVars = {
    urls: urls,
    user: users[userId],
  };

  res.render("urls_index", templateVars);
});

// Create new URL page//
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];

  const templateVars = {
    user: users[userId],
  };

  if (!userId) {
    res.write("Only loggedin user can create New URL");
    res.end();
  } else {
    console.log(`created new shorten URL`);
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session["user_id"];
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };

  console.log(`302 Found`);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];

  const shortURL = req.params.shortURL;
  console.log("userId", userId);

  if (!userId || userId !== urlDatabase[shortURL].userID) {
    res.redirect("/url");
  } else {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      urlUserId: urlDatabase[shortURL].userID,

      user: users[userId],
    };
    res.render("urls_show", templateVars);
    console.log(`200 Ok`);
  }
});

//Delete single URL//
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  console.log(`Delete signleURL`);
  res.redirect("/urls");
});

//Url page jumping to dinamic signle page with edit button//
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

//Dinamic page editing with submit button//
app.post("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];

  urlDatabase[req.params.id] = { longURL: req.body.newURL, userID: userId };

  res.redirect("/urls");
});

//Jmup to the id page//

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  for (const url in urlDatabase) {
    if (shortURL === url) {
      res.redirect(longURL);
    } else {
      res.status(400).send(`the id URL doesn't exit.`);
    }
  }
});

//Login with Email and password//
app.get("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const templateVars = {
    user: user,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const validEmail = getUserByEmail(email, users);

  if (!validEmail) {
    console.log(`This email address is not registed yet`);

    res.status(403).send(`This email address is not registed yet`);
  } else if (!bcrypt.compareSync(password, validEmail?.password)) {
    console.log(`Invaild password`);

    res.status(403).send(`Invalid password`);
  } else {
    console.log(`Valid email and password `);
    // res.cookie("user_id", user[validEmail.id]["id"]);
    req.session.user_id = users[validEmail.id]["id"];
    res.redirect("/urls");
  }
});

// Registraion  page//
app.get("/register", (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  const templateVars = {
    user,
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userId = generateRandomString();
  const validEmail = getUserByEmail(email, users);
  console.log(validEmail);
  if (email === "" || password === "") {
    console.log(`Email or password is empty`);

    res.status(400).send(`Email or password can't be empty`);
  } else if (validEmail) {
    console.log(`This email address is invalid`);

    res.status(400).send(`The email address is invalid`);
    // res.redirect("/register");
  } else {
    getUserByEmail(email, users);
    users[userId] = {
      id: userId,
      email,
      password: hashedPassword,
    };

    req.session.user_id = users[userId]["id"];

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
