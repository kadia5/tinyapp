const {assert} = require ('chai');
const {getUserByEmail} = require ('../helpers.js');

const assertEqual = function (actual, expected) {
  if (actual === expected) {
    console.log (`Assertion Passed: ${actual} === ${expected}`);
  } else {
    console.log (`Assertion failed: ${actual} !== ${expected}`);
  }
  return true;
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe ('getUserByEmail', function () {
  it ('should return a user with valid email', function () {
    const user = getUserByEmail ('user@example.com', users);
    const expectedOutput = 'userRandomID';
  });
  it ('should return a user with non-existent email with undefined', function () {
    const user = getUserByEmail ('use@example.com', users);
    const expectedOutput = 'undefined'; 
  });
});
