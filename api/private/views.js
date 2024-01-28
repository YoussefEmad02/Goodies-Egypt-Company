const { connectToDb, getDb } = require('../../config/db');
const express = require('express');
;
// express app
const app = express();

// listen for requests



// register view engine
app.set('view engine', 'ejs');
// middleware & static files
app.use(express.static('Public'));
app.use(express.static('Public2'));
app.use(express.urlencoded({extended:true}))
module.exports = function (app) {


app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/index', (req, res) => {
  res.render('index', { title: 'Home'});
});


app.get('/careers', (req, res) => {
  res.render('careers', { title: 'Careers' });
});


app.get('/contactUs', (req, res) => {
  res.render('contactUs', { title: 'Contact Us' });
});


app.get('/to-make-show-data-dynamic', (req, res) => {
  res.render('to-make-show-data-dynamic', { title: 'Media' });
});


app.get('/media', (req, res) => {
  res.render('media', { title: 'Media' });
});



app.get('/home-page', (req, res) => {
  res.render('home-page', { title: 'Media' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Media' });
});

app.get('/forms-contactus', (req, res) => {
  res.render('forms-contactus', { title: 'Media' });
});

app.get('/forms-careers', (req, res) => {
  res.render('forms-careers', { title: 'Media' });
});


// 404 page

};