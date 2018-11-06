var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = 3000;
var app = express();


app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/3000", { useNewUrlParser: true });

// Scrape by visiting http://localhost:3000/scrape


// A GET route for scraping the  website
app.get("/scrape", function(req, res) {
    axios.get("http://www.espn.com/college-football/").then(function(response){
        
    var $ = cheerio.load(response.data);

        $("h1.contentItem__title--story").each(function(i, element){


             response.title = $(this).text();
             response.link = $(this).parent().parent().parent().attr("href");

             db.Article.create(res)
             .then(function(dbArticle) {
                 console.log(dbArticle);
             })
             .catch(function(err) {
                 return res.json(err);
             });
        });
        console.log(res.title, res.link);
        res.send("Scrape Complete");
    });
});


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        // res.json(err);
        res.writeContinue(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        // res.json(err);
        res.writeContinue(err);
      });
  });

  
 // Route for saving an Article's Note
app.post("/articles/:id", function(req, res) {

    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) { 
      res.json(dbArticle);
      })
      .catch(function(err) {
        // res.json(err);
        res.writeContinue(err);
      });
  });
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });