// see http://blog.modulus.io/nodejs-and-express-static-content
var express = require('express'), 
	recipients = require('./routes/recipients');

var app = express();


app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
app.use(express.json());
app.use(express.urlencoded());
app.use(express.compress());

// Serve up content from public directory that expires in one day
//app.use(express.static(__dirname + '/public', { maxAge: 86400000 }));// The number of milliseconds in one day
//turning off caching for the time being
app.use(express.static(__dirname + '/public'));

// restful proxy to mongolab
app.get('/recipients', recipients.findAll);
app.get('/recipients/:id', recipients.findById);
app.get('/recipientsTaken', recipients.findTaken);
app.get('/recipientsWaiting', recipients.findWaiting);
app.get('/recipientsByEmail/:email', recipients.findByEmail);

//app.put('/wines/:id', wine.updateWine);
//app.delete('/wines/:id', wine.deleteWine);

app.listen(process.env.PORT || 3000);