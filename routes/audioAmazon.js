'use strict';

const express = require('express');
const request = require('request');
const fs = require('fs');
const http2 = require('http2');
const bodyParser = require('body-parser');
const httpParser = require('http-message-parser');

const awaitResponse = require('./logging/jovoLogging').getSpeech;
const getAccessToken = require('./authorization/authorization').getAccessToken;
const refreshAccessToken = require('./authorization/authorization').refreshAlexaAccessToken;

const audioAmazon = express.Router();

audioAmazon.use(bodyParser.json());

audioAmazon.route('/')
    .post(async(req, res, next) => {

        console.log();
        console.log('============================================ ALEXA ============================================');
        console.log();

        let requestAudio = req.body.requestAudio;
        requestAudio = requestAudio.replace('data:audio/wav;base64,', '');
        let result = '';

        try {
            let accessToken = getAccessToken(req.body.userId, 'alexa');
            result = await postAudioToAmazon(requestAudio, accessToken);
        } catch(e) {
            if(e.statusCode === 403) {
                try {
                    let accessToken = await refreshAccessToken(req.body.userId);
                    result = await postAudioToAmazon(requestAudio, accessToken);
                } catch(e) {
                    console.log(e.message);
                    return res.send('Hä');
                }
            } else {
                res.statusCode = e.statusCode;
                res.send('ERROR');
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


function postAudioToAmazon(audioFile, token) {
    console.log('Building Payload...');
    const payload = buildPayload(audioFile);
    console.log('Payload successfully built.');

    return sendRecognizeRequest(payload, token);
}

function sendRecognizeRequest(payload, token) {
    console.log('Sending Recognize Event...');

    try {
        return new Promise((resolve, reject) => {
            const client = http2.connect('https://avs-alexa-eu.amazon.com/v20160207/events');
            const req = client.request({
                ':method': 'POST',
                ':scheme': 'https',
                ':path': '/v20160207/events',
                'authorization': `Bearer ${token}`,
                'content-type': 'multipart/form-data; boundary=this-is-boundary'
            });

            let statusCode = 200;

            req.on('response', (headers) => {
                statusCode = headers[':status'];
                console.log(headers);
                for(const name in headers) {
                    console.log(`${name}: ${headers[name]}`);
                }
            });

            req.setEncoding('binary');

            let response = '';
            req.on('data', (chunk) => {
                response += chunk;
            });
            req.on('end', async() => {
                if(statusCode != 200) {
                    return reject({
                        statusCode: statusCode
                    })
                }

                const parsedMessage = httpParser(response);
                let multipart = parsedMessage.multipart;

                multipart.forEach((part) => {
                    let headers = part.headers;
                    let bodyBuffer = part.body;

                    if(bodyBuffer) {
                        if(headers['Content-Type'] === 'application/octet-stream') {
                            resolve({
                                status: statusCode,
                                audio: 'data:audio/mpeg;base64,' + Buffer.from(bodyBuffer.toString(), 'binary').toString('base64')
                            });
                        }
                    }
                });
                client.close();
            });
            req.write(payload);
            req.end();
        })
    } catch(e) {
        console.log('FEHLER');
        return '';
    }
}

/**
 * Don't touch, it works!
 * @param audioFile
 * @returns {Buffer}
 */
function buildPayload(audioFile) {
    let metadata = JSON.stringify({
        "context": [
            {
                "header": {
                    "name": "SpeechState",
                    "namespace": "SpeechSynthesizer"
                },
                "payload": {
                    "token": "",
                    "offsetInMilliseconds": 0,
                    "playerActivity": "FINISHED"
                }
            },
            {
                "header": {
                    "namespace": "SpeechRecognizer",
                    "name": "RecognizerState"
                },
                "payload": {}
            }
        ],
        "event": {
            "header": {
                "namespace": "SpeechRecognizer",
                "name": "Recognize",
                "messageId": "messageId-123",
                "dialogRequestId": "dialogRequestId-321"
            },
            "payload": {
                "profile": "CLOSE_TALK",
                "format": "AUDIO_L16_RATE_16000_CHANNELS_1",
                "initiator": {
                    "type": "PRESS_AND_HOLD",
                    "payload": {
                        "token": ""
                    }
                }
            }
        }
    });

    let data = '--this-is-boundary\r\n';
    data += 'Content-Disposition: form-data; name="metadata"\r\n' +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        metadata +
        '\r\n\r\n' +
        '--this-is-boundary\r\n' +
        'Content-Disposition: form-data; name="audio"\r\n' +
        'Content-Type: application/octet-stream\r\n\r\n';

    let payload = Buffer.concat([
        Buffer.from(data, "utf8"),
        Buffer.from(audioFile, 'base64'),
        Buffer.from("\r\n--this-is-boundary\r\n", "utf8"),
    ]);

    return payload;
}

module.exports = audioAmazon;

