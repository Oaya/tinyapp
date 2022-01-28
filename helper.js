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

module.exports = { getUserByEmail, urlsForUser };
