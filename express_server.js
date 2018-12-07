const express = require("express");
const PORT = 8080;
const app = express();
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Database
var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

//url pg
app.get("/urls", (request, response) => {
  let userId = request.cookies["user_id"];
  let userObject = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user: userObject,
  };
  response.render("urls_index", templateVars);
  // console.log(request.cookies.user_id);
});

app.get("/urls/login", (request, response) => {
  response.render("urls_login")
})

//client input pg
app.get("/urls/new", (request, response) => {
  // const username = request.cookies["username"];
  let templateVars = { username: request.cookies };
  response.render("urls_new", templateVars);
});

//after input generate random string
app.post("/urls/new", (request, response) => {
  const shortRandomURL = randomString();
  urlDatabase[shortRandomURL] = request.body.longURL;
  response.redirect("/urls");

})

//login/setting cookie
app.post("/urls/login", (request, response) => {
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
    if (userPass === existingUser.password) {
      response.cookie("user_id", existingUser.id);
      response.redirect("/urls");
    } else {
    response.status(400).end();
    }
  }
})

//logout clearcookies
app.post("/urls/logout", (request, response) => {
  response.clearCookie("user_id"); // clearing cookies
  response.redirect("/urls");
})

//register email
app.get("/urls/register", (request, response) => {
  // const username = req
  response.render("urls_register")
})

//saves Registered data to userdatabase & user_id cookie
app.post("/urls/register", (request, response) => {
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
      password: userPass
    };
    users[userID] = register
    response.cookie("user_id", userID);
    response.redirect("/urls");
  }
});



//Delete
app.post("/urls/:id/delete", (request,response) => {
  delete urlDatabase[request.params.id];
  response.redirect("/urls");
})

//Edit/Add
app.post("/urls/:id", (request,response) => {
  urlDatabase[request.params.id] = request.body.newURL;
  response.redirect("/urls");
})

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
})

//browser dir
app.get("/urls/:id", (request, response) => {
  const username = request.cookies["username"];
  let templateVars = { shortURL: request.params.id,
                       dataKey: urlDatabase,
                       username: request.cookies
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