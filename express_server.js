const express = require("express");
const PORT = 8080;
const app = express();
const bodyParser = require("body-parser")
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//route?
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

//url pg
app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

//client input pg
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

//after input generate random string
app.post("/urls/new", (request, response) => {
  let shortRandomURL = randomString();

  urlDatabase[shortRandomURL] = request.body.longURL;
  response.redirect("/u/" + shortRandomURL);
})


app.post("/urls/:id/delete", (request,response) => {

  delete urlDatabase[request.params.id];
  response.redirect("/urls")
})

app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
})

//browser dir
app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id,
                       regURL: urlDatabase
                     };
  response.render("urls_show", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`)
});








function randomString() {
  var random = '';
  var stringNum = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 6; i++) {
    random += stringNum.charAt(Math.floor(Math.random() * stringNum.length))
  }
  return random;
}