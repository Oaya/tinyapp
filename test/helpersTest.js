const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helper");

const testUsers = {
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

describe("getUserByEmail", () => {
  it("should return a use with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.equal("user@example.com", user.email);
    assert.equal(expectedUserID, user.id);
  });

  it("should return undefined with non exsiting email", () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.equal(undefined, user);
  });
});
