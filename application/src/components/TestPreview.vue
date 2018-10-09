<template>
    <div class="test-preview-container">
        <div class="title">
            <span class="title-content">Preview</span>
        </div>
        <div class="test-content-container">
            <b-card no-body>
                <b-tabs card>
                    <b-tab :title="`${getUpperCase(platform)}`" :class="{ active: platform === 'alexa' }"
                           v-for="platform in (testProp ? testProp.platforms : ['alexa', 'google'])"
                           :key="platform">
                        <div class="conversation" v-for="conversation in (testProp ? testProp.conversations : [])">
                            <div class="message">
                                <div class="request-input-preview speech-bubble" :class="conversation.status[platform]">
                                    <span class="request-input">{{conversation.request.text}}</span>

                                    <button type="button" class="btn btn-primary playRequestAudio"
                                            @click="playAudio(conversation.request.audio, 'request')"
                                            v-if="!requestAudioPlaying">
                                        <font-awesome-icon icon="volume-up"/>
                                    </button>
                                    <button type="button" class="btn btn-primary playRequestAudio"
                                            @click="stopAudio('request')" v-else>
                                        <font-awesome-icon icon="stop"/>
                                    </button>
                                </div>
                            </div>

                            <div class="message">
                                <div class="response-input-preview speech-bubble"
                                     :class="conversation.status[platform]">
                                    <span class="response-input" :class="{ striked: conversation.status[platform] === 'failed' }">
                                        {{conversation.response.text.expected}}
                                    </span>
                                    <span class="response-input" :class="{ disabled: conversation.status[platform] !== 'failed' }">
                                        {{conversation.response.text.actual}}
                                    </span>
                                    <button type="button" class="btn btn-primary playResponseAudio"
                                            @click="playAudio(conversation.response.audio[platform], 'response')"
                                            v-if="!responseAudioPlaying">
                                        <font-awesome-icon icon="volume-up"/>
                                    </button>
                                    <button type="button" class="btn btn-primary playResponseAudio"
                                            @click="stopAudio('response')" v-else>
                                        <font-awesome-icon icon="stop"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                requestAudioPlaying: false,
                requestAudioElement: '',
                responseAudioPlaying: false,
                responseAudioElement: ''
            }
        },
        methods: {
            playAudio: function(audio, type) {
                if(!audio) {
                    return;
                }
                this[type + 'AudioElement'] = new Audio(audio);
                this[type + 'AudioElement'].play();
                this[type + 'AudioElement'].onended = () => {
                    this[type + 'AudioPlaying'] = false;
                };
                this[type + 'AudioPlaying'] = true;
            },
            stopAudio: function(type) {
                this[type + 'AudioElement'].pause();
                this[type + 'AudioPlaying'] = false;
            },
            getUpperCase: function(string) {
                return string.slice(0, 1).toUpperCase() + string.slice(1);
            }
        },
        props: [
            'testProp'
        ]
    }
</script>

<style lang="scss">
    .test-preview-container {
        width: 100%;
        height: 100%;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
        position: relative;

        .title {
            display: table;
            position: absolute;
            width: 95%;
            height: 5%;
            left: 0;
            right: 0;
            margin: auto;
            text-align: left;

            .title-content {
                display: table-cell;
                vertical-align: middle;
                font-weight: bold;
            }
        }

        .test-content-container {
            width: 95%;
            height: 85%;
            margin: auto;
            position: absolute;
            top: 5%;
            right: 0;
            border-radius: 5px;
            left: 0;
            padding-bottom: 30px;
            overflow: hidden;

            .card {
                height: 100%;
                border-style: none;

                .tabs {
                    height: 100%;

                    .card-header {
                        border-style: none;
                        background-color: white;
                        padding: 0;

                        .card-header-tabs {
                            margin: 0 0 -5px;

                            a {
                                color: black;
                            }

                            a:hover {
                                border-color: transparent;
                            }
                        }
                    }

                    .tab-content {
                        height: 100%;
                    }

                    .tab-pane {
                        height: 100%;
                        overflow-y: auto;
                        border-radius: 5px;
                    }

                    .tab-pane.active, .nav-link.active {
                        background-color: #f3f6fb;
                        border-style: none;
                    }
                }

            }

            .conversation {
                width: 100%;
                min-height: 110px;
                height: auto;
                overflow: hidden;

                .message {
                    position: relative;
                    min-height: 65px;
                    height: auto;
                    margin-top: 4%;
                    text-align: left;
                    overflow: hidden;

                    .message-end {
                        content: '';
                        bottom: 0;
                        left: 0;
                        width: 0;
                        height: 0;
                        border: 20px solid transparent;
                        border-top-color: white;
                        border-bottom: 0;
                        border-left: 0;
                        margin-left: 4%;
                        margin-top: 86px;
                    }

                    .playRequestAudio, .playResponseAudio {
                        background-color: transparent;
                        border-color: transparent;
                        position: absolute;
                        width: 30px;
                        height: 30px;
                        font-size: 20px;
                        border-radius: 50%;
                        right: 2%;
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
                            color: black;
                            opacity: .3;
                        }
                    }

                    .playResponseAudio {
                        left: 2%;
                        right: inherit;
                    }

                    .request-input-preview {
                        position: relative;
                        min-height: 50px;
                        height: 100%;
                        width: 50%;
                        float: left;
                        padding: 2%;
                        margin-left: 4%;
                        display: table;
                        background-color: white;
                        border-radius: 5px;

                        .request-input {
                            display: table-cell;
                            vertical-align: middle;
                            width: 85%;

                        }
                    }

                    .request-input-preview.speech-bubble:after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 0;
                        height: 0;
                        border: 10px solid transparent;
                        border-bottom-width: 7px;
                        border-top-width: 7px;
                        border-right-color: white;
                        border-left: 0;
                        margin-top: 7px;
                        margin-left: -10px;
                    }

                    .response-input-preview {
                        position: relative;
                        min-height: 50px;
                        height: 100%;
                        width: 50%;
                        float: right;
                        padding: 2%;
                        margin-right: 4%;
                        background-color: white;
                        border-radius: 5px;

                        .response-input {
                            display: block;
                            width: 85%;
                            float: inherit;
                        }

                        .response-input.disabled {
                            display: none;
                        }

                        .response-input.striked {
                            text-decoration: line-through;
                        }

                        .response-input:hover {
                            text-decoration: none;
                        }
                    }

                    .success {
                        background-color: #a1f3a1;
                    }

                    .request-input-preview.success:after {
                        border-right-color: #a1f3a1 !important;
                    }

                    .response-input-preview.success:after {
                        border-left-color: #a1f3a1 !important;
                    }

                    .failed {
                        background-color: #ffd1d1;
                    }

                    .request-input-preview.failed:after {
                        border-right-color: #ffd1d1 !important;
                    }

                    .response-input-preview.failed:after {
                        border-left-color: #ffd1d1 !important;
                    }

                    .pending, .default {
                        background-color: white;
                    }

                    .pending, .default {
                        border-top-color: white !important;
                    }

                    .response-input-preview.speech-bubble:after {
                        content: '';
                        position: absolute;
                        right: 0;
                        top: 0;
                        width: 0;
                        height: 0;
                        border: 10px solid transparent;
                        border-bottom-width: 7px;
                        border-top-width: 7px;
                        border-left-color: white;
                        border-right: 0;
                        margin-top: 7px;
                        margin-right: -10px;
                    }
                }
            }
        }
        .tab-pane::-webkit-scrollbar {
            display: none;
        }
    }

</style>