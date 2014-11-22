var compression = require('compression')
var express = require('express')

var app = express()

// compress all requests
app.use(compression())

//turning off caching for the time being
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000);