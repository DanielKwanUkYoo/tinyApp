const express = require("express");
const PORT = 8080;
const app = express();
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//route?
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

//url pg
app.get("/urls", (request, response) => {
  const username = request.cookies["username"];
  let templateVars = { urls: urlDatabase, username: username };
  response.render("urls_index", templateVars);
});

//client input pg
app.get("/urls/new", (request, response) => {
  const username = request.cookies["username"];
  let templateVars = { username: username };
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
  response.cookie("username", request.body.username);
  response.redirect("/urls");
})

//logout clearcookies
app.post("/urls/logout", (request, response) => {
  response.clearCookie("username");
  response.redirect("/urls");
})


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
                       username: username
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