'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const jovoLogging = express.Router();

jovoLogging.use(bodyParser.json());

let speech = '';

jovoLogging.route('/')
    .post((req, res, next) => {
        if(!req.body.platform || !req.body.obj) {
            speech = 'Error in getting Speech';
            return res.sendStatus(400);
        }
        try {
            let platform = req.body.platform;
            console.log(platform);
            switch(platform) {
                case 'AlexaSkill': {
                    speech = req.body.obj.response.outputSpeech.ssml;
                    return res.sendStatus(200);
                }
                case 'GoogleAction': {
                    speech = req.body.obj.fulfillmentText;
                    return res.sendStatus(200);
                }
            }
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

