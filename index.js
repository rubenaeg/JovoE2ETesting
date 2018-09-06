'use strict';

const express = require('express');
const app = express();
const authorization = require('./routes/authorization/authorization').authorization;
const audioAmazon = require('./routes/audioAmazon');
const audioGoogleDialogFlow = require('./routes/audioGoogleDialogflow');
const jovoLogging = require('./routes/logging/jovoLogging').jovoLogging;

const port = 8008;

// Serve static files
app.use(express.static('public'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Serve routes
app.use('/authorization', authorization);
app.use('/audio-alexa', audioAmazon);
app.use('/audio-google', audioGoogleDialogFlow);
app.use('/jovo-logging', jovoLogging);


app.listen(port, (err) => {
    if(err) {
        return console.error(err);
    }
    console.log(`App is listening on port ${port}.`);
});