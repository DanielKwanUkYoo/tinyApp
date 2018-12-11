const express = require("express");
const PORT = 8080;
const app = express();
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// function to create random shortURL
function randomString() {
  let random = '';
  const stringNum = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 6; i++) {
    random += stringNum.charAt(Math.floor(Math.random() * stringNum.length))
  }
  return random;
}

//Database
let users = {};

let urlDatabase = {};

// Get /
app.get("/", (request,response) => {
  const userID = request.cookies["user_id"];
  let userObject = users[userID];
  let shortUrls = [];

  let templateVars = {
    urls: urlDatabase[userID],
    shortUrl: shortUrls,
    user: userObject,
  };

  if (userID) {
    response.render("urls_index", templateVars)
  } else {
    response.render("urls_login")
  }
})

//Index Page
app.get("/urls", (request, response) => {
  const userID = request.cookies["user_id"];
  let userObject = users[userID];
  let shortUrls = [];

  for (let x in urlDatabase) {
    for (let shortUrl in urlDatabase[x]) {
      shortUrls.push(shortUrl);
    }
  };

  let templateVars = {
    urls: urlDatabase[userID],
    shortUrl: shortUrls,
    user: userObject,
  };
  response.render("urls_index", templateVars);
});

app.get("/login", (request, response) => {
  response.render("urls_login");
})

//Redirecting if not logged in
app.get("/urls/new", (request, response) => {
  let templateVars = { user: request.cookies["user_id"] };

  if (request.cookies["user_id"]) {
    response.render("urls_new", templateVars);
  } else {
    response.redirect("/login");
  }
});

//Generates random shortURL
app.post("/urls", (request, response) => {
  const userID = request.cookies["user_id"];
  const shortRandomURL = randomString();
  const userInputLong = request.body.longURL;
  if (userID) {
    urlDatabase[userID][shortRandomURL] = userInputLong;
    response.redirect("/urls");
  }
})

//Check Login
app.post("/login", (request, response) => {
  const userEmail = request.body.email;
  const userPass = request.body.password;
  if (userEmail === "" || userPass === "") {
    response.status(400).end();
    return;
  }

  let existingUser = false;
  for (var id in users) {
    if (userEmail === users[id]["email"]) {
      existingUser = users[id];
    }
  }

  if (existingUser) {
    if (bcrypt.compareSync(userPass, existingUser.password)) {
      response.cookie("user_id", existingUser.id);
      response.redirect("/urls");
    } else {
      response.status(400).end();
    }
  } else {
    response.status(400).end();
  }
});

//Logout & Clear cookies
app.post("/urls/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect("/urls");
});

//Register Page displayed when clicked
app.get("/register", (request, response) => {
  response.render("urls_register");
});

//Saves Registered Data to Userdatabase & creates new cookie
app.post("/register", (request, response) => {
  const userEmail = request.body.email;
  const userPass = request.body.password;

  if (userEmail === "" || userPass === "") {
    response.status(400).end();
    return;
  }

  let existingUser = false;
  for (var id in users) {
    if (userEmail === users[id]["email"]) {
      existingUser = users[id];
    }
  }
  if (existingUser) {
    response.status(400).end();
  } else {
    let userID = randomString();
    let register = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(request.body.password, 12)
    };

    urlDatabase[userID] = {};
    users[userID] = register
    response.cookie("user_id", userID);
    response.redirect("/urls");
  }
});

//Delete added websites
app.post("/urls/:id/delete", (request,response) => {
  const userID = request.cookies["user_id"];
  const id = request.params.id;
  delete urlDatabase[userID][id];
  response.redirect("/urls");
})

//Edit
app.post("/urls/:id", (request,response) => {
  const userID = request.cookies["user_id"];
  urlDatabase[userID][request.params.id] = request.body.newURL;

  response.redirect("/urls");
});

//shorURL gets redirected to webpage
app.get("/u/:shortURL", (request, response) => {
  const shortRandomURL = request.params.shortURL;
  const userID = request.cookies["user_id"];
  let keyFound = "";
  for (owner in urlDatabase) {
    if (userID === owner || !userID) {
      for (data in urlDatabase[owner]) {
        if (data === shortRandomURL) {
          response.redirect(urlDatabase[owner][data])
        }
      }
    }
  }
});

//Edit page
app.get("/urls/:id", (request, response) => {
  const username = request.cookies["username"];
  let templateVars = { shortURL: request.params.id,
                       user:request.cookies["user_id"]
                     };
  response.render("urls_show", templateVars);
})


app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});

