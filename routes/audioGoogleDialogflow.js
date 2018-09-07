'use strict';

const express = require('express');
const request = require('request');

const awaitResponse = require('./logging/jovoLogging').getSpeech;
const getAccessToken = require('./authorization/authorization').getAccessToken;
const refreshAccessToken = require('./authorization/authorization').refreshGoogleAccessToken;

const audioGoogleDialogflow = express.Router();

audioGoogleDialogflow.use(express.json({limit: '50mb'}));

const url = 'https://dialogflow.googleapis.com/v2/projects/testagent-f08db/agent/sessions/g2:detectIntent';


audioGoogleDialogflow.route('/')
    .post(async (req, res, next) => {

        console.log();
        console.log('============================================ GOOGLE ============================================');
        console.log();

        let requestAudio = req.body.requestAudio;
        requestAudio = requestAudio.replace('data:audio/wav;base64,', '');

        let payload = buildPayload(requestAudio);
        let result = {};

        try {
            console.log('Access TOken? ');
            let accessToken = getAccessToken(req.body.userId, 'google');
            result = await sendRequest(payload, accessToken);
        } catch(e) {
            console.log(e.statusCode);
            console.log(e);

            if(e.statusCode === 401) {
                try {
                    console.log('REtriebing ');
                    let accessToken = await refreshAccessToken(req.body.userId);
                    console.log(accessToken);
                    result = await sendRequest(payload, accessToken);
                } catch(e) {
                    console.log(e.message);
                    return res.send('Refresh Token is not valid anymore or Dialogflow Endpoint is not running.');
                }
            }
        }

        let speech = awaitResponse();

        let responseBody = JSON.stringify({
            audioContent: result.audio,
            audioText: speech,
        });

        res.statusCode = result.status;
        res.send(responseBody);

    });

function buildPayload(audioFile) {
    return  JSON.stringify({
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
        inputAudio: audioFile
    });
}

function sendRequest(payload, token) {
    return new Promise((resolve, reject) => {
        request.post({
            url: url,
            body: payload,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (err, response, body) => {
            if(err) {
                console.log('Error');
                reject({
                    statusCode: 500,
                    message: 'ERROR'
                });
            } else {
                console.log('Success');
                console.log(response.statusCode);

                if(response.statusCode !== 200) {
                    if(response.statusCode === 401) {
                        return reject({
                            statusCode: response.statusCode,
                            message: 'Access Token invalid.',

                        });
                    }
                }

                resolve({
                    audioContent: 'data:audio/wav;base64,' +  JSON.parse(body).outputAudio,
                    status: 200
                });
            }
        })
    })
}

module.exports = audioGoogleDialogflow;