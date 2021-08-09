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
const cookieSession = require ('cookie-session');
const app = express ();
const PORT = 8080; // default port 8080
const bodyParser = require ('body-parser');
const bcryptjs = require ('bcryptjs');
const password = '1'; // found in the req.params object
const hashedPassword = bcryptjs.hashSync (password, 10);
const {
  //  emailAlreadyTaken,
  getUserByEmail,
} = require ('./helpers');

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: '101@example.com',
    password: bcryptjs.hashSync ('1', 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcryptjs.hashSync ('2', 7),
  },
};

app.use (
  cookieSession ({
    name: 'session',
    keys: ['key'],
  })
);
app.set ('view engine', 'ejs');
app.use (bodyParser.urlencoded ({extended: true}));

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};

app.get ('/urls/new', (req, res) => {
  const longURL = req.params.longURL;
  const user_id = req.session.user_id;
  const templateVars = {user: users[user_id]};
  res.render ('urls_new', templateVars);
});

app.get ('/', (req, res) => {
  //when logged in it is has data inside, else undefined
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect ('/login');
  } else {
    res.redirect ('/urls');
  }
});

app.get ('/urls.json', (req, res) => {
  res.json (urlDatabase);
});

app.get ('/hello', (req, res) => {
  res.send ('<html><body>Hello <b>World</b></body></html>\n');
});

app.get ('/urls', (req, res) => {
  const user_id = req.session.user_id;
console.log(urlDatabase)
  if (!user_id) {
    res.redirect ('/login');
  } else {
    let filteredUrls = {};

    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === user_id) {
        filteredUrls[url] = urlDatabase[url];
      }
    }
    const templateVars = {urls: filteredUrls, user: users[user_id]};
    res.render ('urls_index', templateVars);
  }
});

app.get ('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  if(urlDatabase[shortURL].userID !== user_id) {
    res.send('These Do Not Belong To You')
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[user_id],
  };
  res.render ('urls_show', templateVars);
});

app.get ('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  // const longURL = shortURL;
  if (!longURL.includes('http://')) {
    longURL = 'http://' + longURL
  }
  res.redirect(longURL);
  // console.log("blah",longURL)
  // res.send(longURL)
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

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect (`/urls/${shortURL}`);
});

app.post ('/urls/:shortURL/delete', (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    res.redirect ('/login');
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect (`/urls`);
});

app.post ('/urls/:shortURL/edit', (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    res.redirect ('/login');
  }
  const shortURL = req.params.shortURL;
  res.redirect (`/urls/${shortURL}`);
});

app.post ('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.url;
  res.redirect (`/urls`);
});

app.post ('/login', (req, res) => {
  // first value below is created key, 2nd is value assigned to key
  if (req.body.email === '' || req.body.password === '') {
    return res.status (403).send ('Must enter email or password!');
  }
  if (getUserByEmail (req.body.email, users)) {
    const user = getUserByEmail (req.body.email, users);
    let checkPassword = bcryptjs.compareSync (req.body.password, user.password);

    if (!checkPassword) {
      return res.status (403).send ("Password doesn't match");
    }
    req.session.user_id = user.id;
    res.redirect (`/urls`);
  } else {
    return res.status (403).send ("Email or password doesn't match");
  }
});

app.post ('/logout', (req, res) => {
  req.session.user_id = '';
  res.redirect (`/urls`);
});

app.post ('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status (400).send ('Must enter email or password!');
  }
  //below is how to use a true/false function
  if (getUserByEmail (req.body.email, users)) {
    return res.status (400).send ('Email Already Taken');
  }

  const user_id = generateRandomString ();
  const password = req.body.password;
  const user = {
    id: user_id,
    email: req.body.email,
    password: bcryptjs.hashSync (password, 10),
  };
  //below = user name(rando), user info (object above) saved to users
  users[user_id] = user;
  req.session.user_id = user_id;
  res.redirect (`/urls`);
});

app.listen (PORT, () => {
  console.log (`Example app listening on port ${PORT}!`);
});
