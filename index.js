const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

let mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Data object schemas
const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date 
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
})

const logDataSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date
})

const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  count: Number,
  log: [logDataSchema]
})

let Exercise = mongoose.model('Exercise', exerciseSchema);
let User = mongoose.model('User', userSchema);
let Log = mongoose.model('Log', logSchema);

// User routes
app.post("/api/users", (req, res, next) => {
  const userDoc = new User({
    username: req.body['username']
  });

  userDoc.save(function(err, user) {
    if (err){ 
      console.error(err);
      next(err);
    }
    res.json(user);
  });
});

app.get("/api/users", (req, res, next) => {
  const userQuery = User.find({}).select("username id");
  
  userQuery.exec((err, users) => {
    if (err) next(err);
    res.json(users);
  });
});

app.post("/api/users/:_id/exercises", (req, res, next) => {
  const userId = req.params._id;

  const userQuery = User.find({_id: userId}).select("username");
  userQuery.exec((err, users) => {
    if (err) next(err);

    console.log("user: " + users[0]);
    console.log("username: " + users[0].username);
    
    let date = req.body['date'];
    console.log("*********");
    console.log("date: " + date);
    if(typeof date === 'undefined') {
      date = new Date();
      console.log("set date: " + date);
    }
    console.log("date: " + date);
    console.log("*********");

    
    const exerciseDoc = new Exercise({
      username: users[0].username,
      description: req.body['description'],
      duration: req.body['duration'],
      date: date 
    });

      exerciseDoc.save(function(err, user) {
        if (err) next(err);
        console.log("Response: " + users[0]);
        res.json(users[0]);
      });
  });
});

app.post("/api/users/:_id/logs", (req, res, next) => {
  const userId = req.params._id;

  const userQuery = User.find({_id: userId}).select("username");
  userQuery.exec((err, users) => {
    if (err) next(err);
  });
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
