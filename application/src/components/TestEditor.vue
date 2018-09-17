<template>
    <div class="test-editor-container">
        <div class="test-content-container">
            <div class="title-input-container">
                <input v-model="test.title" type="text" placeholder="Title"/>
            </div>
            <div class="platform-selection">
                <label>
                    Platforms:
                </label>
                <div class="platforms-container">
                    <button type="button" class="btn btn-primary alexa-icon-button" @click="selectTestPlatform('alexa')"
                            :class="{ active: checkForTestPlatform('alexa') }">
                        <img src="@/assets/amazon-alexa-logo-D1BE24A213-seeklogo.com.png"/>
                    </button>
                    <button type="button" class="btn btn-primary google-icon-button"
                            @click="selectTestPlatform('google')"
                            :class="{ active: checkForTestPlatform('google') }">
                        <img src="@/assets/2000px-Google_Assistant_logo.svg.png"/>
                    </button>
                </div>
                <div class="exit-container" @click="exit">
                    <font-awesome-icon icon="times"/>
                </div>
            </div>
            <div class="new-test-container">
                <div class=test-content-container>
                    <div class="conversation" v-for="(conversation, i) in test.conversations">
                        <div class="message">
                            <div class="request-input-preview speech-bubble">
                                <textarea placeholder="Say Hello." :ref="`requestInput_${i}`" class="request-input" v-model="conversation.request.text"></textarea>
                            </div>
                            <button type="button" class="btn btn-primary recording" v-on:mousedown="startRecording"
                                    v-on:mouseup="stopRecording(i)">
                                <font-awesome-icon icon="microphone"/>
                            </button>
                            <button type="button" class="btn btn-primary play" @click="playAudio(i)" v-if="!audioPlaying">
                                <font-awesome-icon icon="volume-up" />
                            </button>
                            <button type="button" class="btn btn-primary play" @click="stopAudio()" v-else>
                                <font-awesome-icon icon="stop" />
                            </button>
                        </div>

                        <div class="message">
                            <div class="response-input-preview speech-bubble">
                                <textarea placeholder="Hello World!" :ref="`responseInput_${i}`" class="response-input" v-model="conversation.response.text.expected"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="add-new-conversation">
                        <button type="button" class="btn btn-primary add-test-button" @click="addConversation">
                            <font-awesome-icon icon="plus"/>
                        </button>
                    </div>
                </div>
            </div>
            <div class="test-buttons-container">
                <div class=test-content-container>
                    <button type="button" class="btn btn-primary add-test-button" @click="addTest()">
                        <font-awesome-icon icon="check" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    let Recorder = require('../recording/recorder').default;

    export default {
        data: function() {
            return {
                test: JSON.parse(JSON.stringify(this.testToEditProp)),
                recorder: '',
                audioPlaying: false,
                audioElement: '',
                mediaStream: ''
            }
        },
        props: [
            'testToEditProp',
        ],
        methods: {
            addTest: function() {
                if(!this.test.title) {
                    return this.$emit('throwError', 'Test requires a title');
                }
                if(this.test.platforms.length === 0) {
                    return this.$emit('throwError', 'Select a platform!')
                }

                console.log(this.test.platforms);
                console.log(this.test);

                this.test.status = 'default';

                for(let conversation of this.test.conversations) {
                    conversation.status.alexa = 'default';
                    conversation.status.google = 'default';
                }
                this.$emit('editTestFinal', JSON.parse(JSON.stringify(this.test)));
                this.exit();
            },
            exit: function() {
                this.$emit('showTestEditor', false);
            },
            addConversation: function() {
                this.test.conversations.push({
                    request: {
                        text: '',
                        audio: ''
                    },
                    response: {
                        text: {
                            expected: '',
                            actual: ''
                        },
                        audio: {
                            google: '',
                            alexa: ''
                        }
                    },
                    status: {
                        alexa: '',
                        google: ''
                    }
                });
            },
            startRecording: function() {
                let recorder = new Recorder();
                this.recorder = recorder;
                recorder.start(this.mediaStreamProp);
            },
            stopRecording: function(index) {
                let recorder = this.recorder;
                recorder.stop((audio) => {
                    this.updateRequestAudioContent(audio, index);
                });
            },
            playAudio: function(index) {
                console.log(this.audioPlaying);
                this.audioElement = new Audio(this.getAudio(index));
                this.audioElement.onended = () => {
                    this.audioPlaying = false;
                };
                this.audioElement.play();
                this.audioPlaying = true;
            },
            stopAudio: function() {
                let audio = this.audioElement;
                audio.pause();
                this.audioPlaying = false;
            },
            getAudio: function(index) {
                if(this.test.conversations[index]) {
                    return this.test.conversations[index].request.audio;
                }
            },
            updateRequestAudioContent: function(audio, index) {
                let conversations = this.test.conversations;

                if(conversations.length <= index) {
                    let arr = [index + 1];
                    for(let i = 0; i < conversations.length; i++) {
                        arr[i] = conversations[i];
                    }

                    arr[index] = {
                        request: {
                            text: '',
                            audio: audio
                        },
                        response: {
                            text: {
                                expected: '',
                                actual: ''
                            },
                            audio: ''
                        },
                        status: 'default'
                    };

                    conversations = arr;
                } else {
                    if(!conversations[index]) {
                        conversations[index] = {
                            request: {
                                text: '',
                                audio: audio
                            },
                            response: {
                                text: {
                                    expected: '',
                                    actual: ''
                                },
                                audio: ''
                            },
                            status: 'default'
                        }
                    } else {
                        conversations[index].request.audio = audio;
                    }
                }
                this.test.conversations = conversations;
            },
            selectTestPlatform: function(platform) {
                // TODO redundant, function to delete it, checkForPlatform returns -1 or index
                for(let i = 0; i < this.test.platforms.length; i++) {
                    if(this.test.platforms[i] === platform) {
                        return this.test.platforms.splice(i, 1);
                    }
                }
                this.test.platforms.push(platform);
            },
            checkForTestPlatform: function(platform) {
                for(let p of this.test.platforms) {
                    if(platform === p) {
                        return true;
                    }
                }
                return false;
            }
        },
        watch: {
            testToEditProp: function() {
                this.test = JSON.parse(JSON.stringify(this.testToEditProp));
            }
        },
        mounted: async function() {
            let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
        }
    }
</script>

<style lang="scss">
    .test-editor-container {
        width: 69%;
        height: 59%;
        max-width: 725px;
        max-height: 600px;
        min-width: 490px;
        background-color: white;
        border-radius: 5px;
        -webkit-box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
        box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
        position: absolute;
        bottom: 0;
        left: 0;
        top: 0;
        margin: auto;
        right: 0;

        .test-content-container {
            width: 95%;
            height: 95%;
            margin: auto;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            border-radius: 5px;
            left: 0;

            .test-buttons-container {
                position: relative;
                width: 100%;
                height: 16%;

                .test-content-container {
                    width: 100%;

                    .add-test-button {
                        position: absolute;
                        right: 0;
                        bottom: 0;
                        border-radius: 50%;
                        height: 40px;
                        width: 40px;
                    }
                }
            }

            .new-test-container {
                width: 100%;
                height: 66%;
                border-radius: 5px;
                position: relative;
                display: inline-block;

                .test-content-container {
                    width: 100%;
                    height: 100%;
                    background-color: #f3f6fb;
                    margin: auto;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    border-radius: 5px;
                    left: 0;
                    overflow-y: auto;
                    padding-bottom: 5%;

                    .add-new-conversation {
                        width: 20%;
                        margin: auto;
                        button {
                            background-color: #c4d6e9;
                            border-color: #c4d6e9;
                            border-radius: 50%;
                        }
                    }

                    .conversation {
                        width: 100%;
                        min-height: 35%;
                        margin-bottom: 2%;

                        .message {
                            position: relative;
                            height: 100px;
                            margin-top: 4%;
                            
                            textarea::-webkit-scrollbar {
                                display: none;
                            }

                            .play {
                                background-color: #3BB273;
                                border-color: #3BB273;
                                position: absolute;
                                width: 40px;
                                height: 40px;
                                font-size: 20px;
                                border-radius: 50%;
                                left: 63%;
                                top: 0;
                                bottom: 0;
                                margin: auto;
                                -webkit-transition: 0.3s;
                                transition: 0.3s;

                                .fa-volume-up, .fa-stop {
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    margin: auto;
                                }
                            }

                            .recording {
                                background-color: #3BB273;
                                border-color: #3BB273;
                                position: absolute;
                                width: 40px;
                                height: 40px;
                                font-size: 20px;
                                border-radius: 50%;
                                left: 56%;
                                top: 0;
                                bottom: 0;
                                margin: auto;
                                transition: 0.3s;

                                .fa-microphone {
                                    position: absolute;
                                    margin: auto;
                                    top: 0;
                                    bottom: 0;
                                    right: 0;
                                    left: 0;
                                }
                            }

                            .recording:hover {
                                border-color: #3BB273;
                            }

                            .recording:focus {
                                box-shadow: none;
                            }

                            .recording:active {
                                box-shadow: 0 0 0 0.2rem rgba(40, 138, 86, 0.5);
                                transform: scale(1.1);
                            }

                            .request-input, .response-input {
                                border-style: none;
                                resize: none;
                                width: 100%;
                                height: 100%;
                                word-break: break-word;
                                text-align: left;
                            }

                            .request-input-preview {
                                position: relative;
                                height: 100%;
                                width: 50%;
                                padding: 2%;
                                margin-left: 4%;
                                display: table;
                                background-color: white;
                                border-radius: 5px;
                            }

                            .request-input-preview.speech-bubble:after {
                                content: '';
                                position: absolute;
                                bottom: 0;
                                left: 0;
                                width: 0;
                                height: 0;
                                border: 20px solid transparent;
                                border-top-color: white;
                                border-bottom: 0;
                                border-left: 0;
                                margin-left: 0;
                                margin-bottom: -15px;
                            }

                            .response-input-preview {
                                position: relative;
                                height: 100%;
                                width: 50%;
                                float: right;
                                padding: 2%;
                                display: table;
                                margin-right: 4%;
                                background-color: white;
                                border-radius: 5px;

                                .response-input {
                                    display: table-cell;
                                    vertical-align: middle;
                                }
                            }

                            .response-input-preview.speech-bubble:after {
                                content: '';
                                position: absolute;
                                bottom: 0;
                                right: 0;
                                width: 0;
                                height: 0;
                                border: 20px solid transparent;
                                border-top-color: white;
                                border-bottom: 0;
                                border-right: 0;
                                margin-left: -10px;
                                margin-bottom: -15px;
                            }

                            [contentEditable=true]:empty:not(:focus):before {
                                content: attr(data-placeholder);
                                opacity: 0.6;
                            }
                        }
                    }
                }

                .test-content-container::-webkit-scrollbar {
                    display: none;
                }
            }

            .title-input-container {
                display: inline-block;
                position: relative;
                float: left;
                width: 20%;
                height: 10%;

                input {
                    border-style: none;
                    border-bottom: 1px solid grey;
                    position: absolute;
                    width: 100%;
                    left: 7%;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                    height: 60%;
                }
            }

            .exit-container {
                position: absolute;
                right: 0;
                opacity: .3;
                cursor: pointer;
            }

            .platform-selection {
                width: 50%;
                display: inline-block;
                float: right;
                height: 10%;
                position: relative;

                label {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    height: 50%;
                    left: 0;
                    margin: auto;
                }

                .platforms-container {
                    position: absolute;
                    width: 20%;
                    left: 80px;
                    min-width: 60px;
                    height: 100%;
                    top: 0;
                    bottom: 0;
                    margin: auto;

                    .alexa-icon-button, .google-icon-button {
                        height: 30px;
                        width: 30px;
                        background-color: white;
                        border-radius: 50%;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                        border-style: none;
                        opacity: .3;

                        img {
                            width: 20px;
                            height: 20px;
                            left: 0;
                            position: absolute;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            margin: auto;
                        }
                    }

                    .alexa-icon-button.active, .google-icon-button.active {
                        opacity: 1;
                        /*box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5)*/
                    }

                    .btn-primary:focus, .btn-primary.focus {
                        box-shadow: none !important;
                    }

                    .google-icon-button {
                        right: 0;
                    }

                    .alexa-icon-button {
                        left: 0;
                    }
                }

            }

            .start-tests-button {
                position: absolute;
                bottom: 0;
                right: 0;
                margin: 2%;
                height: 50px;
                width: 50px;
                border-radius: 50%;
            }
        }
    }

</style>