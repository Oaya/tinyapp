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

//Helper function //
const checkByEmail = (newEmail) => {
  for (const id in user) {
    if (user[id].email === newEmail) {
      return user[id];
    }
    return false;
  }
};

//Home page//
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Url page//
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    urls: urlDatabase,
    user: user[userId],
  };

  res.render("urls_index", templateVars);
});

// Create new URL page//
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  console.log(userId);
  const templateVars = {
    user: user[userId],
  };

  if (!userId) {
    res.write("Only loggedin user can create New URL");
    res.end();
  } else {
    console.log(`200 Ok`);
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL: longURL, userId: userId };

  res.redirect(`/urls/${shortURL}`);
  console.log(`302 Found`);
});

//Jmup to the id page//

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  for (const url in urlDatabase) {
    if (shortURL === urlDatabase[url]) {
      res.redirect(longURL);
    } else {
      res.render("error");
    }
  }
});

//single URL details page//
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,

    user: user[userId],
  };
  res.render("urls_show", templateVars);
  console.log(`200 Ok`);
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
  urlDatabase[req.params.id] = { longURL: req.body.newURL };

  res.redirect("/urls");
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
    res.statusCode = 403;
    res.write("This email address is not registed yet");
    res.end();
  } else if (validEmail && validEmail.password !== password) {
    console.log(`Invaild password`);
    res.statusCode = 403;
    res.write("Invaild password");
    res.end();
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
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  const validEmail = checkByEmail(email);

  if (email === "" || password === "") {
    console.log(`Email of password is empty`);
    res.statusCode = 400;
    res.write("400 Email or password can't be empty");
    res.end();
  } else if (validEmail) {
    console.log(`The email address is invalid`);
    res.statusCode = 400;
    res.write("The email address is invalid");
    // res.redirect("/register");
    res.end();
  } else {
    checkByEmail(email);
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

//Logout and clear the user_id for cookie//
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port${PORT}`);
});
