const generateUserHelper = (urlDatabase) => {
  const getUserByEmail = (email, database) => {
    for (const id in database) {
      if (database[id].email === email) {
        return database[id];
      }
    }
    return false;
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
  return { getUserByEmail, urlsForUser };
};

module.exports = { generateUserHelper };
