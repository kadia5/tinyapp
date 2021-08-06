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
const express = require ('express');
const cookieSession = require('cookie-session')
const app = express ();
const PORT = 8080; // default port 8080
const bodyParser = require ('body-parser');
const bcryptjs = require('bcryptjs');
const password = "1"; // found in the req.params object
const hashedPassword = bcryptjs.hashSync(password, 10);

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: '101@example.com',
    password: bcryptjs.hashSync("1", 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcryptjs.hashSync('2', 7)
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




//change email to 1@1.com password to 1

app.use(cookieSession({
  name: 'session',
  keys: ['key']

}))
app.set ('view engine', 'ejs');
app.use (bodyParser.urlencoded ({extended: true}));

const urlDatabase = {

  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }

};

app.get ('/urls/new', (req, res) => {
  const longURL = req.params.longURL
  const user_id = req.session.user_id;
  const templateVars = {user: users[user_id],};
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
  console.log ('user id from cookie', req.session.user_id);
  const user_id = req.session.user_id;
  if(!user_id){
    res.redirect('/login');
  }
  console.log ('user info', users[user_id]);
  const templateVars = {urls: urlDatabase, user: users[user_id]};
  res.render ('urls_index', templateVars);
});

app.get ('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[user_id],
  };
  res.render ('urls_show', templateVars);
});

app.get ('/u/:shortURL', (req, res) => {
  const longURL = shortURL;
  res.redirect (longURL);
});

app.get ('/register', (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {urls: urlDatabase, user: req.session.user};
  res.render ('urls_register', templateVars);
});

app.get ('/login', (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {urls: urlDatabase, user: req.session.user};
  res.render ('urls_login', templateVars);
});

app.post ('/urls', (req, res) => {
  let shortURL = generateRandomString ();
  console.log(req.body)
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  // console.log(randoString);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, 
    userID: req.session.user_id,
  
  };
  // console.log(urlDatabase);
  res.redirect (`/urls`);
});

app.post ('/urls/:longURL/delete', (req, res) => {
  const user_id = req.session.user_id;
  if(!user_id){
    res.redirect('/login');
  }
  const longURL = req.params.longURL;
  delete urlDatabase[longURL];

  res.redirect (`/urls`);
});

app.post ('/urls/:longURL/edit', (req, res) => {
  // console.log("i miss kyle lowry already")
  const user_id = req.session.user_id;
  if(!user_id){
    res.redirect('/login');
  }
  const longURL = req.params.longURL;
  res.redirect (`/urls/${longURL}`);
});


app.post ('/urls/:id', (req, res) => {
  //checks
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.url;
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
    let checkPassword = bcryptjs.compareSync(req.body.password, user.password)
    if (!checkPassword) {
      return res.status(403).send("Password doesn't match");
    }

    req.session.user_id = user.id;
    res.redirect(`/urls`);
  }
});

app.post ('/logout', (req, res) => {
  req.session.user_id = "";
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
  const password = req.body.password
  const user = {
    id: user_id,
    email: req.body.email,
    password: bcryptjs.hashSync(password, 10),
  };
  //below = user name(rando), user info (object above) saved to users
  users[user_id] = user;
  console.log (users);

  req.session.user_id = user_id;
  res.redirect (`/urls`);
});

app.listen (PORT, () => {
  console.log (`Example app listening on port ${PORT}!`);
});
