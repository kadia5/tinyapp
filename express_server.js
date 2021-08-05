function generateRandomString () {
  let result = '';
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt (
      Math.floor (Math.random () * characters.length)
    );
  }
  return result;
}

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: '101@example.com',
    password: '1',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const emailAlreadyTaken = function (inputEmail) {
  console.log(inputEmail)

  for (let key in users) {
    console.log(users[key].email)
    if (users[key].email == inputEmail) {
      return true;
    }
  }
  return false;
};

const getUser = function (inputEmail) {
  for (let key in users) {
    if (users[key].email == inputEmail) {
      return users[key];
    }
  }
};

const express = require ('express');
var cookieParser = require ('cookie-parser');
const app = express ();
const PORT = 8080; // default port 8080
const bodyParser = require ('body-parser');

//change email to 1@1.com password to 1

app.use (cookieParser ());
app.set ('view engine', 'ejs');
app.use (bodyParser.urlencoded ({extended: true}));
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get ('/urls/new', (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {user: users[user_id]};
  res.render ('urls_new', templateVars);
});

app.get ('/', (req, res) => {
  res.send ('Hello!');
});

app.get ('/urls.json', (req, res) => {
  res.json (urlDatabase);
});

app.get ('/hello', (req, res) => {
  res.send ('<html><body>Hello <b>World</b></body></html>\n');
});

app.get ('/urls', (req, res) => {
  console.log ('user id from cookie', req.cookies.user_id);
  const user_id = req.cookies.user_id;
  console.log ('user info', users[user_id]);
  const templateVars = {urls: urlDatabase, user: users[user_id]};
  res.render ('urls_index', templateVars);
});

app.get ('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: users[user_id],
  };
  res.render ('urls_show', templateVars);
});

app.get ('/u/:shortURL', (req, res) => {
  const longURL = shortURL;
  res.redirect (longURL);
});

app.get ('/register', (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {urls: urlDatabase, user: req.cookies.user};
  res.render ('urls_register', templateVars);
});

app.get ('/login', (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {urls: urlDatabase, user: req.cookies.user};
  res.render ('urls_login', templateVars);
});

app.post ('/urls', (req, res) => {
  let shortURL = generateRandomString ();
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  // console.log(randoString);
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect (`/urls/${shortURL}`);
});

app.post ('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect (`/urls`);
});

app.post ('/urls/:shortURL/edit', (req, res) => {
  // console.log("i miss kyle lowry already")
  const shortURL = req.params.shortURL;
  res.redirect (`/urls/${shortURL}`);
});

app.post ('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.url;
  res.redirect (`/urls`);
});

//params is data contand in path of url + body = data in form submiss. +query is data in urls query string(e/t at end of ?)
app.post('/login', (req, res) => {
  console.log("login called", req)
  // first value below is created key, 2nd is value assigned to key
  if(req.body.email === '' || req.body.password === '') {
    return res.status(403).send('Must enter email or password!');
  }
  console.log(emailAlreadyTaken(req.body.email))
  if (emailAlreadyTaken(req.body.email)) {
    console.log("email present")
    const user = getUser(req.body.email);
    if (user.password !== req.body.password) {
      return res.status(403).send("Password doesn't match");
    }
    res.cookie('user_id', user.id);
    res.redirect(`/urls`);
  }
});

app.post ('/logout', (req, res) => {
  res.cookie ('user_id', '');
  //  urlDatabase[username]= req.body.url;
  res.redirect (`/urls`);
});

app.post ('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status (400).send ('Must enter email or password!');
  }
  //below is how to use a true/false function
 if (emailAlreadyTaken (req.body.email)) {
    return res.status (400).send ('Email Already Taken');
  }

  const user_id = generateRandomString ();
  const user = {
    id: user_id,
    email: req.body.email,
    password: req.body.password,
  };
  //below = user name(rando), user info (object above) saved to users
  users[user_id] = user;
  console.log (users);

  res.cookie ('user_id', user_id);
  res.redirect (`/urls`);
});

app.listen (PORT, () => {
  console.log (`Example app listening on port ${PORT}!`);
});
