const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require('./dbConnect');
const User = require('./db/userModel');
const auth = require('./auth');
dbConnect();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response, next) => {
  response.json({ message: 'Hey! This is your server response!' });
  next();
});
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = new User({
      email,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save().then((result) => {
      res.status(201).send({
        result,
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
app.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })

    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          console.log(passwordCheck);
          if (!passwordCheck) {
            return res.status(400).send({
              message: 'Passwords  not match',
              error,
            });
          }

          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            'RANDOM-TOKEN',
            { expiresIn: '24h' }
          );

          res.status(200).send({
            message: 'Login Successful',
            email: user.email,
            token,
          });
        })
        .catch((error) => {
          console.log('entered last');
          res.status(400).send({
            message: 'Passwords does not match',
            error,
          });
        });
    })
    .catch((e) => {
      response.status(404).send({
        message: 'Email not found',
        e,
      });
    });
});
app.get('/auth-endpoint', auth, (request, response) => {
  response.json({ message: 'You are authorized to access me' });
});

module.exports = app;
