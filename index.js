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

// Schema and model definition
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [{
    description:{ type: String, required: true },
    duration:{ type: Number, required: true },
    date: { type: Date, required: true }
  }]
})

const User = mongoose.model("User",userSchema)

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
  const userQuery = User.find({}).select("username _id");
  
  userQuery.exec((err, users) => {
    if (err) next(err);
    res.json(users);
  });
});

app.post("/api/users/:_id/exercises", (req, res, next) => {
  const userId = req.params._id;
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
  const description = req.body.description;
  const duration = req.body.duration;
  
  const exerciseLog = {
    description,
    duration,
    date
  }

  User.findByIdAndUpdate(
    userId,
    {
      $push: {
        log: exerciseLog
      }
    },
    { new: true },
    (err, updatedUser) => {
      if(err) return console.log('error updating user:', err);
      
      let response = {
        "_id": userId,
        "username": updatedUser.username,
        "date": exerciseLog.date,
        "duration": parseInt(exerciseLog.duration),
        "description": exerciseLog.description
      }
      
      res.json(response)
    }
  )
});

app.get("/api/users/:_id/logs", (req, res, next) => {
  const userId = req.params._id;

  const userQuery = User.find({_id: userId}).select('log');
  userQuery.exec((err, users) => {
    if(err) next(err);
    res.json(users);
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
