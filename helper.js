// const generateUserHelper = (urlDatabase) => {
//   //single URL details page//

//   return { getUserByEmail, urlsForUser };
// };

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

module.exports = { getUserByEmail, urlsForUser, generateRandomString };
