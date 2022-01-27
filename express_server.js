const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

//create randomstring for password and url//
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//Helper function //
const checkByEmail = (newEmail) => {
  for (const id in user) {
    if (user[id].email === newEmail) {
      return user[id];
    }
    return false;
  }
};

//single URL details page//
const urlsForUser = (id) => {
  let urls = {};
  for (const data in urlDatabase) {
    if (urlDatabase[data].userID === id) {
      urls[data] = { longURL: urlDatabase[data].longURL, userID: id };
    }
  }
  return urls;
};

//middleware//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

//Landing Page//
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Url page//
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const urls = urlsForUser(userId);

  const templateVars = {
    urls: urls,
    user: user[userId],
  };

  res.render("urls_index", templateVars);
});

// Create new URL page//
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    user: user[userId],
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
  const userId = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };

  console.log(`302 Found`);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];

  const shortURL = req.params.shortURL;
  console.log("userId", userId);

  if (!userId || userId !== urlDatabase[shortURL].userID) {
    res.redirect("/url");
  } else {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      urlUserId: urlDatabase[shortURL].userID,

      user: user[userId],
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
  const userId = req.cookies["user_id"];

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
  const user = checkByEmail(req.body.email);
  const templateVars = {
    user: user,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const validEmail = checkByEmail(email);

  if (!validEmail) {
    console.log(`This email address is not registed yet`);

    res.status(403).send(`This email address is not registed yet`);
  } else if (validEmail?.password !== password) {
    console.log(`Invaild password`);

    res.status(403).send(`Invalid password`);
  } else {
    console.log(`Valid email and password `);
    res.cookie("user_id", user[validEmail.id]["id"]);
    res.redirect("/urls");
  }
});

// Registraion  page//
app.get("/register", (req, res) => {
  const user = checkByEmail(req.body.email);

  const templateVars = {
    user: user,
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const userId = generateRandomString();
  const validEmail = checkByEmail(email);

  if (email === "" || password === "") {
    console.log(`Email or password is empty`);

    res.status(400).send(`Email or password can't be empty`);
  } else if (validEmail) {
    console.log(`This email address is invalid`);

    res.status(400).send(`The email address is invalid`);
    // res.redirect("/register");
  } else {
    checkByEmail(email);
    user[userId] = {
      id: userId,
      email,
      password,
    };

    console.log(`Registered new user`);
    res.cookie("user_id", user[userId]["id"]);
    res.redirect("/urls");
  }
});

//Logout and clear the user_id for cookie//
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
