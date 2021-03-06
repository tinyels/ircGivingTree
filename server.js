// see http://blog.modulus.io/nodejs-and-express-static-content
var express = require('express');
var compression = require('compression');
var app = express();

// The number of milliseconds in one day
var oneDay = 86400000;

// Use compress middleware to gzip content
app.use(compression());

// Serve up content from public directory
//app.use(express.static(__dirname + '/public', { maxAge: oneDay }));

//turning off caching for the time being
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000);