const { connectToDb, getDb } = require('../../config/db');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
// middleware & static files
app.use(express.static('Public'));
app.use(express.static('Public2'));
app.use(express.urlencoded({extended:true}))

// express app


// listen for requests



// register view engine

module.exports = function (app) {
  //Register HTTP endpoint to render /index page
  app.get('/login', (req, res) => {
    res.render('login', { title: 'Media' });
  });

};