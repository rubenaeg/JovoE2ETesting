'use strict';

const express = require('express');
const request = require('request');

const getSpeech = require('./logging/jovoLogging').getSpeech;
const getAccessToken = require('./authorization/authorization').getAccessToken;
const refreshAccessToken = require('./authorization/authorization').refreshGoogleAccessToken;
const getGoogleProjectId = require('./authorization/authorization').getGoogleProjectId;
const getGoogleProjectLanguageCode = require('./authorization/authorization').getGoogleProjectLanguageCode;

const audioGoogleDialogflow = express.Router();

audioGoogleDialogflow.use(express.json({limit: '50mb'}));

audioGoogleDialogflow.route('/')
    .post(async (req, res, next) => {

        console.log();
        console.log('============================================ GOOGLE ============================================');
        console.log();

        let requestAudio = req.body.requestAudio;
        let userId = req.body.userId;
        requestAudio = requestAudio.replace('data:audio/wav;base64,', '');
        let projectId = getGoogleProjectId(userId);
        let languageCode = getGoogleProjectLanguageCode(userId);

        let payload = buildPayload(requestAudio, languageCode);
        let result = {};

        try {
            console.log('Access Token? ');
            let accessToken = getAccessToken(req.body.userId, 'google');
            result = await sendRequest(payload, accessToken, projectId);
        } catch(e) {
            res.statusCode = e.statusCode;

            if(e.statusCode === 401) {
                try {
                    console.log('REtriebing ');
                    let accessToken = await refreshAccessToken(req.body.userId);
                    console.log(accessToken);
                    result = await sendRequest(payload, accessToken, projectId);
                } catch(e) {
                    console.log(e.message);
                    return res.send('Refresh Token is not valid anymore or Dialogflow Endpoint is not running.');
                }
            } else if(e.statusCode === 400) {
                res.statusCode = 204;
                return res.send('Bad Request, nothing changed.');
            }

            return res.send('ERROR');

        }

        let speech = getSpeech();

        let responseBody = JSON.stringify({
            audioContent: result.audio,
            audioText: speech,
        });

        res.statusCode = result.status;
        res.send(responseBody);

    });

function buildPayload(audioFile, languageCode) {
    return  JSON.stringify({
        queryInput: {
            audioConfig: {
                audioEncoding: 'AUDIO_ENCODING_LINEAR_16',
                sampleRateHertz: 16000,
                languageCode: languageCode
            }
        },
        outputAudioConfig: {
            audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
            sampleRateHertz: 16000
        },
        inputAudio: audioFile
    });
}

function sendRequest(payload, token, projectId) {
    const url = 'https://dialogflow.googleapis.com/v2/projects/' + projectId + '/agent/sessions/g2:detectIntent';

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
                    return reject({
                        statusCode: response.statusCode,
                        message: 'Error for Google'
                    })
                }

                console.log(body);

                resolve({
                    audio: 'data:audio/wav;base64,' +  JSON.parse(body).outputAudio,
                    status: 200
                });
            }
        })
    })
}

module.exports = audioGoogleDialogflow;