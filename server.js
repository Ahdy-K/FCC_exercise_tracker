const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const User = require('./models/User')
const Exer = require('./models/Exer')
const cors = require('cors')
const url = require('url');
const moment = require('moment');
const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercice' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
/*app.use(expressValidator({
  errorFormatter: function(param, msg, value){
      let namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;
      while(namespace.length){
          formParam += '[' + namespace.shift() +']'
      }
      return {
          param: formParam,
          msg : msg,
          value : value
      }
  }
}))*/

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
// New user registration

app.post('/api/exercise/new-user', (req, res)=>{
  let newUser = {username: req.body.username}
  User.findOne(newUser, (err, user)=>{
    if(err){
      res.json(err)
    }else if(user){
      res.json({error:'user already exists'} )
    }else {
      User.create(newUser, (err, user)=>{
        if(err){
          return res.json(err)
        }else {
          //console.log(user)
          res.json(user)
        }
      })
    }
  })
  
})

// Adding exercise

app.post('/api/exercise/add', (req, res)=>{
    
  let exercise = {
    userId : req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  }
  console.log(exercise.userId)
  Exer.create(exercise, (err, exercise)=>{
    if(err){
      res.json(err)
    }else {
      User.findById(exercise.userId, (err, user)=>{
        if(err){
          res.json(err)
        }else if(user){
          res.json({username: user.username, description:exercise.description,
          duration: exercise.duration,id : exercise._id, date: exercise.date})
        }else{
          res.json({error: 'invalid userId'})
        }
      })
      
    }
  })//}
})

// get filter exercises by userId & date

app.get('/api/exercise/log',(req, res)=>{
  /*const paramtr = new URLSearchParams(req.params.para);
  console.log(paramtr.toString())
  console.log(paramtr.get('userId'))
  let query={
    userId: paramtr.get('userId')
  }
  res.json(query)
})*/
  
  User.find({username:req.query.username},(err, user)=>{
    console.log(req.query)
    if(err){
      res.json({error: 'user not registred '})
    }else if(user){
      userId= user.userId
      console.log(user.username);
      let query = {
        userId: user.userId
      }
      if(req.query.from || req.query.to) {
        query.date = {}
        console.log(req.query)
        if(req.query.from)
          query.date.$gte = moment(req.query.from).format('YYYY-MM-DD')
        if(req.query.to)
          query.date.$lte = moment(req.query.to).format('YYYY-MM-DD')
      }
     
      Exer.find(query).sort({ 'date': -1 }).limit(parseInt(req.query.limit))
        .then(result =>(res.json(result)))
        .catch(err => res.json(err))
    }
  })
})
    
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
