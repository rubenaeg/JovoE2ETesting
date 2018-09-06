'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const jovoLogging = express.Router();

jovoLogging.use(bodyParser.json());

let speech = '';

jovoLogging.route('/')
    .post((req, res, next) => {
        console.log(req.body);
        speech = req.body.response.outputSpeech.ssml;
    });

function getSpeech() {
    let text = speech;
    speech = '';
    console.log(text);
    return text.replace(/<speak>/g, '').replace(/<\/speak>/g, '');
}

module.exports.jovoLogging = jovoLogging;
module.exports.getSpeech = getSpeech;

