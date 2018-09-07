<template>
    <div class="test-list-container">
        <div class="title">
            <span class="title-content">List</span>
        </div>
        <div class="test-content-container">
            <div class="test-selection-container">
                <input class="test-items-selection" type="checkbox" @click="selectAllTests($event.target.checked)"
                       ref="testItemsSelection"/>
            </div>

            <ul class="test-item-list">
                <li class="test-item" v-for="(test, index) in tests">
                    <input class="test-item-selection" type="checkbox"
                           @click="selectTest($event.target.checked, index)"
                           :ref="`testItemSelection_${index}`"/>
                    <div class="platforms-container">
                        <div class="alexa-icon-button" :class="{ active: hasPlatform(test, 'alexa') }">
                            <img src="@/assets/amazon-alexa-logo-D1BE24A213-seeklogo.com.png"/>
                        </div>
                        <div class="google-icon-button" :class="{ active: hasPlatform(test, 'google') }">
                            <img src="@/assets/2000px-Google_Assistant_logo.svg.png"/>
                        </div>
                    </div>
                    <div class="test-item-details-container" @click="activate(index)"
                         :class="{'not-active': selectedTest !== index}">
                         <span class="test-status">
                            <font-awesome-icon icon="check-circle" :class="{ active: test.status === 'success' }"/>
                            <font-awesome-icon icon="exclamation-circle" :class="{ active: test.status === 'failed' }"/>
                             <font-awesome-icon icon="spinner" class="fa-spin"
                                                :class="{ active: test.status === 'pending' }"/>
                        </span>
                        <div class="test-item-title-container">
                            <div class="test-item-title">{{test.title}}</div>
                        </div>
                    </div>
                    <div class="test-actions-container">
                        <div class="edit-test-container" @click="$emit('editTest', index)">
                            <font-awesome-icon icon="pen"/>
                        </div>
                        <div class="delete-test-container" @click="deleteTest(index)">
                            <font-awesome-icon icon="trash"/>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="list-buttons-container">
            <button type="button" class="btn btn-primary add-test" @click="$emit('addNewTest')">
                <font-awesome-icon icon="plus"/>
            </button>
            <button type="button" class="btn btn-primary start-tests" @click="startTests">
                <font-awesome-icon icon="play"/>
            </button>
        </div>


    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                testsToTest: [],
                tests: JSON.parse(JSON.stringify(this.testsProp)),
                selectedTest: this.selectedTestProp
            }
        },
        props: [
            'testsProp',
            'selectedTestProp',
        ],
        methods: {
            activate: function(index) {
                console.log(this.testsToTest);
                console.log(this.$refs);

                this.$emit('setSelectedTest', index);
            },
            startTests: async function() {
                for(let i of this.testsToTest.sort((a, b) => {
                    return a - b;
                })) {
                    let test = this.tests[i];
                    this.activate(i);
                    this.$emit('updateTestStatus', 'pending', i);

                    // Run tests for all registered platforms
                    for(let platform of test.platforms) {
                        let status = 'success';
                        console.log('Platform: ' + platform);

                        for(let [j, conversation] of test.conversations.entries()) {
                            let requestAudio = conversation.request.audio;
                            let responseText = conversation.response.text.expected;

                            let data = JSON.stringify({
                                userId: this.$route.params.id,
                                requestAudio: requestAudio
                            });
                            console.log('Sending Request...');

                            let url = 'http://localhost:8008/audio-' + platform;
                            try {
                                let response = await this.$http.post(url, data);
                                console.log('Request sent.');
                                console.log(response);
                                if(response.body.audioText !== responseText) {
                                    status = 'failed';
                                    this.$emit('updateConversationStatus', status, i, j);
                                    this.$emit('updateTestResponseContent', response.body, i, j);
                                    break;
                                }

                                this.$emit('updateConversationStatus', status, i, j);
                                this.$emit('updateTestResponseContent', response.body, i, j);

                                console.log('Done!');
                            } catch(e) {
                                console.log('ERROR');
                                status = 'failed';
                                break;
                            }
                        }
                        this.$emit('updateTestStatus', status, i);
                    }
                }
            },
            deleteTest: function(index) {
                this.$emit('deleteTest', index);
                for(let i = 0; i < this.testsToTest.length; i++) {
                    if(this.testsToTest[i] === index) {
                        this.testsToTest.splice(i, 1);
                    }
                }
            },
            hasPlatform: function(test, platform) {
                for(let p of test.platforms) {
                    if(p === platform) {
                        return true;
                    }
                }
                return false;
            },
            selectAllTests: function(selected) {
                console.log(this.$refs);
                for(let ref in this.$refs) {
                    if(ref === 'testItemsSelection') {
                        continue;
                    }
                    this.$refs[ref][0].checked = selected;
                    this.selectTest(selected, parseInt(ref.split('_')[1]));
                }
            },
            selectTest: function(selected, index) {
                if(selected) {
                    if(!this.testsToTest.includes(index)) {
                        this.testsToTest.push(index);
                    }
                } else {
                    this.$refs.testItemsSelection.checked = false;
                    for(let i = 0; i < this.testsToTest.length; i++) {
                        if(this.testsToTest[i] === index) {
                            this.testsToTest.splice(i, 1);
                        }
                    }
                }
            }
        },
        watch: {
            testsProp: function() {
                this.tests = JSON.parse(JSON.stringify(this.testsProp));
            },
            selectedTestProp: function() {
                this.selectedTest = this.selectedTestProp;
            }
        }
    }
</script>

<style lang="scss">

    .test-list-container {
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

        .list-buttons-container {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            height: 10%;
            width: 95%;

            button {
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                margin: auto;
                border-radius: 50%;
                width: 45px;
                height: 45px;
            }

            .add-test {
                right: 55px;
            }
        }

        .test-content-container {
            width: 95%;
            height: 85%;
            background-color: #f3f6fb;
            margin: auto;
            position: absolute;
            top: 5%;
            right: 0;
            border-radius: 5px;
            left: 0;

            .test-selection-container {
                position: relative;
                height: 7%;
                width: 90%;
                padding: 2%;
                margin: auto;
                border-bottom: #dbdbdb 1px solid;

                .test-items-selection {
                    position: absolute;
                    left: 2%;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                }
            }

            .test-item-list {
                list-style: none;
                padding: 2%;
                height: 100%;
                overflow-y: auto;

                .not-active {
                    opacity: .6;
                }

                .test-item {
                    margin-bottom: 4%;
                    width: 90%;
                    height: 7%;
                    max-height: 55px;
                    min-height: 55px;
                    margin-left: auto;
                    margin-right: auto;
                    position: relative;

                    .platforms-container {
                        position: absolute;
                        width: 16%;
                        min-width: 60px;
                        max-width: 65px;
                        left: 6%;
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
                        }

                        .google-icon-button {
                            right: 0;
                        }
                    }

                    .test-item-selection {
                        margin: auto;
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                    }

                    .test-actions-container {
                        width: 10%;
                        height: 65%;
                        position: absolute;
                        top: 0;
                        right: 10%;
                        bottom: 0;
                        margin: auto;

                        .edit-test-container, .delete-test-container {
                            width: 45%;
                            opacity: .3;
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            margin: auto;
                            height: 70%;
                        }

                        .edit-test-container:hover, .delete-test-container:hover {
                            cursor: pointer;
                            opacity: .4;
                        }

                        .edit-test-container {
                            left: 0;
                        }

                        .delete-test-container {
                            right: 0;
                        }
                    }

                    .test-item-details-container {
                        background-color: white;
                        width: 47%;
                        height: 100%;
                        position: absolute;
                        -webkit-box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
                        box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
                        border-radius: 5px;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        margin: auto;

                        .test-status {
                            position: absolute;
                            left: 0;
                            top: 0;
                            bottom: 0;
                            font-size: 22px;

                            svg:not(.active) {
                                display: none;
                            }

                            .active {
                                display: inherit;
                            }

                            .fa-ellipsis-h,
                            .fa-check-circle,
                            .fa-exclamation-circle,
                            .fa-spinner {
                                position: absolute;
                                top: 0;
                                bottom: 0;
                                margin: auto;
                            }

                            .fa-ellipsis-h,
                            .fa-spinner {
                                /*color: #E9BF03;*/
                                color: #BCBCBC
                            }

                            .fa-check-circle {
                                color: #3EA001;
                            }

                            .fa-exclamation-circle {
                                color: #A31111;
                            }
                        }

                        .test-item-title-container {
                            display: table;
                            height: 100%;
                            width: 50%;
                            margin: auto;

                            .test-item-title {
                                display: table-cell;
                                vertical-align: middle;
                            }
                        }
                    }
                }
            }

            .test-item-list::-webkit-scrollbar {
                display: none;
            }
        }
    }

</style>