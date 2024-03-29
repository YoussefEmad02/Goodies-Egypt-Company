const path = require('path');
const express = require('express');
const app = express();
const authMiddleware = require('./middleware/auth');
const privateApiRoutes = require('./api/private/index');
const publicApiRoutes = require('./api/public/index');
const publicViewRoutes = require('./api/public/views');
const privateViewRoutes = require('./api/private/views');
app.use(express.static('Public'));
app.use(express.static('Public2'));
const port = 3000;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Config setup to allow our HTTP server to serve static files from our public directory
app.use(express.static('public'));
// Config setup to parse JSON payloads from HTTP POST request body
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// All public routes can be accessible without authentication

// uncomment to view frontend
publicViewRoutes(app);
publicApiRoutes(app);// uncomment

// If the request is not for a public view/api, then it must pass
// through our authentication middleware first
 app.use(authMiddleware); // uncomment

// The routes/views below can only be accessed if the user is authenticated

// uncomment to view frontend
privateViewRoutes(app);
privateApiRoutes(app);

// If request doesn't match any of the above routes then render the 404 page

app.use(function(req, res, next) {
  return res.status(404).render('404');
});

// Create HTTP Server and Listen for Requests
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});