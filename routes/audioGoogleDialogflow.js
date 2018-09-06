'use strict';

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const getAccessToken = require('./authorization/authorization').getAccessToken;
const refreshAccessToken = require('./authorization/authorization').refreshGoogleAccessToken;

const audioGoogleDialogflow = express.Router();
audioGoogleDialogflow.use(bodyParser.json());

const url = 'https://dialogflow.googleapis.com/v2beta1/projects/adventuregame-fd13f/agent/sessions/g2:detectIntent';

audioGoogleDialogflow.route('/')
    .post(async (req, res, next) => {

        console.log();
        console.log('============================================ GOOGLE ============================================');
        console.log();

        let requestAudio = req.body.requestAudio;
        requestAudio = requestAudio.replace('data:audio/wav;base64,', '');
        // let accessToken = getAccessToken(req.body.id, 'google');
        let accessToken = await refreshAccessToken(req.body.userId);

        let body = JSON.stringify({
            queryInput: {
                audioConfig: {
                    audioEncoding: 'AUDIO_ENCODING_LINEAR_16',
                    sampleRateHertz: 16000,
                    languageCode: 'de'
                }
            },
            outputAudioConfig: {
                audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
                sampleRateHertz: 16000
            },
            inputAudio: requestAudio
        });

        request.post({
            url: url,
            body: body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }, (err, response, body) => {
            if(err) {
                console.log('Error');
                res.send('ERROR');
            } else {
                console.log('Success');
                let response = {
                    audioContent: 'data:audio/wav;base64,' +  JSON.parse(body).outputAudio,
                    audioText: ''
                };
                res.send(response);
            }
        })
    });

module.exports = audioGoogleDialogflow;