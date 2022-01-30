const bcrypt = require("bcryptjs");

const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return undefined;
};

const urlsForUser = (id, urlDatabase) => {
  let urls = {};
  for (const data in urlDatabase) {
    if (urlDatabase[data].userID === id) {
      urls[data] = { longURL: urlDatabase[data].longURL, userID: id };
    }
  }
  return urls;
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const checkAuthentication = (email, password, users) => {
  const validEmail = getUserByEmail(email, users);
  if (!validEmail) {
    return { error: "This email address is not registered yet.", data: null };
  } else if (!bcrypt.compareSync(password, validEmail?.password)) {
    return { error: "Invalid password", data: null };
  } else {
    return { error: null, data: users[validEmail.id]["id"] };
  }
};

const addUser = (email, password, users) => {
  const validEmail = getUserByEmail(email, users);
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    console.log(`Email or password is empty`);
    return { error: `Email or password can't be empty`, data: null };
  } else if (validEmail) {
    console.log(`This email address is invalid`);
    return { error: `The email address is invalid`, data: null };
  } else {
    users[userId] = {
      id: userId,
      email,
      password: hashedPassword,
    };
    return { error: null, data: users[userId]["id"] };
  }
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  checkAuthentication,
  addUser,
};
