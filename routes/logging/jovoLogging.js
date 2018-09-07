'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const jovoLogging = express.Router();

jovoLogging.use(bodyParser.json());

let speech = '';

jovoLogging.route('/')
    .post((req, res, next) => {
        console.log(req.body);
        try {
            speech = req.body.response.outputSpeech.ssml;
        } catch(e) {
            speech = 'Error in getting Speech!';
        }
    });

function getSpeech() {
    let text = speech;
    speech = '';
    return text.replace(/<speak>/g, '').replace(/<\/speak>/g, '');
}

module.exports.jovoLogging = jovoLogging;
module.exports.getSpeech = getSpeech;

