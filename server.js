const express = require('express');
const app = express();

const { createHmac } = require("crypto");
const bodyParser = require("body-parser");

// Middleware for parsing the body of POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB/Mongoose stuff
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true},
    password: { type: String, required: true},
    private: { type: Boolean, default: false }
});

const ExerciseSchema = new mongoose.Schema({
    userId: { type: String, required: true},
    username: { type: String, required: true},
    description: { type: String, required: true},
    duration: { type: Number, required: true},
    date: { type: Number, required: true},
    private: { type: Boolean, default: false }
});

const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

// Path for static assets
app.use(express.static('dist'));

// Entry point
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

// Returns list of all public exercises
app.get("/api/exercises", (req, res) => {
    const query = { private: false };
    if(req.query.lt && !isNaN(Number(req.query.lt))) query.date = {$lt: Number(req.query.lt)};
    const limit = req.query.limit && !isNaN(Number(req.query.limit)) ? Number(req.query.limit) : 0;
    Exercise.find(query).limit(limit).select("description duration date username userId").sort({date: "desc"}).exec((err, data) => {
      if(err) return res.json({ error: "Error connecting to the database" });
      const exercises = data.map(item => {
        return {
          description: item.description,
          duration: item.duration,
          date: new Date(item.date).toDateString(),
          username: item.username,
          _id: item.userId,
          _timestamp: item.date
        };
      });
      res.json(exercises);
    });
});

// Pulls a log of exercises for a user
app.get("/api/users/:_id/logs", (req, res) => {
    const id = req.params._id;
    // Looking up the user
    User.findOne({_id: id}, (err, user) => {
      if(err) return res.json({ error: "Error connecting to the database" });
      if(!user) return res.json({ error: "Couldn't find the user with id " + id });
      // Handling the search parameters
      const query = {userId: user._id};
      if(req.query.from && !isNaN(Date.parse(req.query.from))) query.date = {$gte: Date.parse(req.query.from)};
      if(req.query.to && !isNaN(Date.parse(req.query.to))) query.date ? query.date["$lte"] = Date.parse(req.query.to) : query.date = {$lte: Date.parse(req.query.to)};
      const limit = req.query.limit && !isNaN(Number(req.query.limit)) ? Number(req.query.limit) : 0;
      // Pulling the exercise log
      Exercise.find(query).limit(limit).select("description duration date -_id").sort({date: "desc"}).exec((err, data) => {
        if(err) return res.json({ error: "Error fetching the exercises" });
        const log = data.map(item => {
          return {
            description: item.description,
            duration: item.duration,
            date: new Date(item.date).toDateString(),
            _timestamp: item.date
          };
        });
        res.json({
          _id: user._id,
          username: user.username,
          count: data.length,
          log: log
        });
      });
    });
});

// Creates a new user
app.post("/api/users", function (req, res) {
    if(!req.body) return res.json({ error: "Invalid request" });
    // Validating the username
    const userName = req.body.username;
    if(!userName || typeof userName !== "string" || !/^[A-Z0-9_]{3,30}$/i.test(userName)) return res.json({ error: "Invalid username" });
    // Checking if the username already exists
    User.findOne({ username: userName }, (err, data) => {
      if(err) return res.json({ error: "Error connecting to the database" });
      if(data) {
        return res.json({ error: "This username already exists" });
      }
      // Checking and encrypting the password
      const password = req.body.password;
      if(!password || typeof password !== "string" || !/^[A-Z0-9_?!@#$%^&*~]{3,30}$/i.test(password)) return res.json({ error: "Invalid password" });
      const hash = createHmac("sha256", process.env.SALT).update(password).digest("hex");
      // Saving new user
      const user = new User({ username: userName, password: hash, private: req.body.private === "true" });
      user.save((err, data) => {
        if(err) return res.json({ error: "Error occured while saving the user" });
        res.json({
          username: data.username,
          _id: data._id,
          _t: hash
        });
      });
    });
});

// Logs user in
app.post("/api/login", (req, res) => {
    if(!req.body) return res.json({ error: "Invalid request" });
    authentificate({
      userId: req.body._id && /[a-f\d]{24}/.test(req.body._id) ? req.body._id : null,
      userName: req.body.username && /^[A-Z0-9_]{3,30}$/i.test(req.body.username) ? req.body.username : null,
      password: req.body.password && /^[A-Z0-9_?!@#$%^&*~]{3,30}$/i.test(req.body.password) ? req.body.password : null,
      token: req.body._t && /^[A-F0-9]{64}$/i.test(req.body._t) ? req.body._t : null
    }, (err, data) => {
      if(err) return res.json({ error: err });
      if(!data) return res.json({ error: "User not found. Check login and password" });
      res.json({
        username: data.username,
        _id: data._id,
        _t: data.password
      });
    });
});

// Uploads a new exercise 
app.post("/api/users/:_id/exercises", (req, res) => {
    const id = req.params._id;
    // Validating the data
    if(!req.body || !req.body.description || req.body.description.length > 240 || !req.body.duration || !req.body._t || isNaN(Number(req.body.duration))) return res.json({ error: "Invalid request" });
    // Looking up the user
    User.findOne({ _id: id }, (err, data) => {
      if(err) return res.json({ error: "Error connecting to the database" });
      if(!data) return res.json({ error: "Couldn't find the user with id " + id });
      // Checking the password
      if(req.body._t !== data.password) return res.json({ error: "Invalid request" });
      // Figuring out the date
      const date = req.body.date && !isNaN(Date.parse(req.body.date)) ? Date.parse(req.body.date) : Date.now() - 28800000;
      //Saving the exercise
      const exercise = new Exercise({
        userId: data._id.toString(),
        username: data.username,
        description: req.body.description.replace(/<\s*\/*\s*[A-Z0-9][^>]*>/ig, ""),
        duration: Number(req.body.duration),
        date: date,
        private: data.private
      });
      exercise.save((err, data) => {
        if(err) return res.json({ error: "Error saving the exercise" });
        res.json({
          _id: data.userId,
          username: data.username,
          description: data.description,
          duration: data.duration,
          date: new Date(data.date).toDateString()
        });
      });
    });
});

// Listening for requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Handling authentification
function authentificate(user, callback) {
    if(!(user.userId || user.userName) && !(user.password || user.token)) return callback("Invalid request", null);
    const query = {};
    if(user.userId) query._id = user.userId;
    if(user.userName) query.username = user.userName;
    if(user.password) {
      const hash = createHmac("sha256", process.env.SALT).update(user.password).digest("hex");
      query.password = hash;
    }
    if(user.token) {
      query.password = user.token;
    }
    User.findOne(query, (err, data) => {
      if(err) return callback("Error connecting to the database", null);
      callback(null, data);
    });
}