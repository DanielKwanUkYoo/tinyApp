const express = require("express");
const PORT = 8080;
const app = express();
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Database
var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
}


var urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

//Index Page
app.get("/urls", (request, response) => {
  let userID = request.cookies["user_id"];
  let userObject = users[userID];
  let shortUrls = [];
  for (let x in urlDatabase) {
    for (let shortUrl in urlDatabase[x]) {
      shortUrls.push(shortUrl)
    }
  }

  let templateVars = {
    urls: urlDatabase[userID],
    shortUrl: shortUrls,
    user: userObject,
  };
  response.render("urls_index", templateVars);

});

app.get("/login", (request, response) => {
  response.render("urls_login")
})

//client input pg
app.get("/urls/new", (request, response) => {
  let templateVars = { user: request.cookies["user_id"] };
  if (request.cookies["user_id"]) {
    response.render("urls_new", templateVars);
  } else {
    response.redirect("/login")
  }
});

//after input generate random string
app.post("/urls", (request, response) => {
  const userID = request.cookies["user_id"]
  const shortRandomURL = randomString();
  const userInputLong = request.body.longURL
  if (userID) {
    urlDatabase[userID][shortRandomURL] = userInputLong;
    response.redirect("/urls");
  }
})

//login/setting cookie
app.post("/login", (request, response) => {
  const userEmail = request.body.email;
  const userPass = request.body.password;
  if (userEmail === "" || userPass === "") {
    response.status(400).end();
    return;
  }

  var existingUser = false;
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

//logout clearcookies
app.post("/urls/logout", (request, response) => {
  response.clearCookie("user_id"); // clearing cookies

  response.redirect("/urls");
})

//register email
app.get("/register", (request, response) => {
  // const username = req
  response.render("urls_register")
})

//saves Registered data to userdatabase & user_id cookie
app.post("/register", (request, response) => {
  const userEmail = request.body.email;
  const userPass = request.body.password;
  if (userEmail === "" || userPass === "") {
    response.status(400).end();
    return;
  }

  var existingUser = false;
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

//Delete
app.post("/urls/:id/delete", (request,response) => {
  const userID = request.cookies["user_id"]
  const id = request.params.id
  delete urlDatabase[userID][id]
  response.redirect("/urls");
})

//Edit/Add
app.post("/urls/:id", (request,response) => {
  const userID = request.cookies["user_id"]
  urlDatabase[userID][request.params.id] = request.body.newURL;
  response.redirect("/urls");
})



app.get("/u/:shortURL", (request, response) => {
  const shortRandomURL = request.params.shortURL;
  const userID = request.cookies["user_id"];
  let keyFound = ""
  for (owner in urlDatabase) {
    if (userID === owner) {
      for (data in urlDatabase[owner]) {
        if (data === shortRandomURL) {
          response.redirect(urlDatabase[owner][data])
        }
      }
    }
  }
})

//browser dir
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








function randomString() {
  var random = '';
  var stringNum = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 6; i++) {
    random += stringNum.charAt(Math.floor(Math.random() * stringNum.length))
  }
  return random;
}