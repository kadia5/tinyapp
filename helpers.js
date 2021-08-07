// const users = require('./users')
// const emailAlreadyTaken = function (inputEmail, users) {
//   console.log (inputEmail);

//   for (let key in users) {
//     console.log (users[key].email);
//     if (users[key].email == inputEmail) {
//       return true;
//     }
//   }
//   return false;
// };
const getUserByEmail = function (inputEmail, users) {
  for (let key in users) {
    if (users[key].email == inputEmail) {
      return users[key];
    }
  }
};

module.exports = {
  // emailAlreadyTaken,
  getUserByEmail,
}

