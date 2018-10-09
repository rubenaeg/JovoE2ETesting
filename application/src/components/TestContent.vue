<template>
    <div class="test-content-container">
        <transition name="fade">
            <div class="error" v-if="error">
                <span>
                    <font-awesome-icon icon="exclamation-circle"/>
                    {{error}}
                </span>
            </div>
        </transition>
        <div class="google-authorization-input-overlay-container" v-if="this.$route.query.gA">
            <div class="form-group">
                <div class="exit-container" @click="exitGoogleAuthorizationContainer">
                    <font-awesome-icon icon="times"/>
                </div>
                <div class="project-id-input-container">
                    <label>Project ID:</label>
                    <input class="form-control project-id-input" placeholder="projectId-1234" type="text"
                           ref="projectIdInput"/>
                </div>
                <div class="language-input-container">
                    <label>Language:</label>
                    <select class="form-control language-input" ref="languageInput">
                        <option v-for="languageCode in ['de', 'en']">{{languageCode}}</option>
                    </select>
                </div>
                <button class="btn btn-primary" @click="saveGoogleAuthorizationInput">Save</button>
            </div>
        </div>
        <div class="column-left">
            <test-list ref="testList" :tests-prop="tests" :selected-test-prop="selectedTest"
                       @updateTestStatus="updateTestStatus"
                       @updateTestResponseContent="updateTestResponseContent"
                       @updateConversationStatus="updateConversationStatus"
                       @addNewTest="addNewTest"
                       @editTest="editTest"
                       @deleteTest="deleteTest"
                       @setSelectedTest="setSelectedTest"/>
        </div>
        <div class="column-right">
            <test-preview :test-prop="tests[this.selectedTest]" ref="preview"/>
        </div>
        <div class="test-editor-overlay-container" :class="{ active: testEditorIsActive}">
            <test-editor @showTestEditor="showTestEditor" @editTestFinal="editTestFinal" @throwError="throwError"
                         :test-to-edit-prop="testToEdit"/>
        </div>
    </div>
</template>
<script>
    import TestPreview from './TestPreview'
    import TestList from './TestList'
    import TestEditor from './TestEditor'

    export default {
        components: {
            TestEditor,
            TestPreview,
            TestList
        },
        data: function() {
            return {
                selectedTest: 0,
                testEditorIsActive: false,
                tests: [],
                testToEdit: {
                    title: '',
                    conversations: [
                        {
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
                                google: '',
                                alexa: ''
                            }
                        }
                    ],
                    platforms: ['alexa', 'google']
                },
                editingTestIndex: -1,
                error: '',
            }
        },
        methods: {
            setSelectedTest: function(index) {
                this.selectedTest = index;
            },
            updateTestsArray: function() {
                // Workaround to update array whenever an edit happens
                this.tests = this.tests.slice();
            },
            updateTestStatus: function(status, index) {
                this.tests[index].status = status;
                this.updateTestsArray();
            },
            /**
             * Updates the status of the conversation the system is currently testing.
             * Each platform will have a respective status
             * @param status            - the status {success, failed, pending, default}
             * @param platform          - the platform that is currently tested
             * @param testIndex         - the index of current test
             * @param conversationIndex - the index of current conversation
             */
            updateConversationStatus: function(status, platform, testIndex, conversationIndex) {
                this.tests[testIndex].conversations[conversationIndex].status[platform] = status;
                this.updateTestsArray();
            },
            updateTestResponseContent: function(responseBody, platform, testIndex, conversationIndex) {
                this.tests[testIndex].conversations[conversationIndex].response.audio[platform] = responseBody.audioContent;
                console.log('Updating Test Response Content');
                this.tests[testIndex].conversations[conversationIndex].response.text.actual = responseBody.audioText ?
                    responseBody.audioText : 'No speech text detected!';

                console.log(responseBody.audioText);
                this.updateTestsArray();
            },
            showTestEditor: function(isActive) {
                this.testEditorIsActive = isActive;
            },
            addNewTest: function() {
                this.testToEdit = {
                    title: '',
                    conversations: [
                        {
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
                                google: '',
                                alexa: ''
                            }
                        }
                    ],
                    platforms: ['alexa', 'google']
                };
                this.editingTestIndex = -1;
                this.showTestEditor(true);
            },
            editTest: function(index) {
                this.selectedTest = index;
                this.testToEdit = this.tests[index];
                this.editingTestIndex = index;
                this.showTestEditor(true);
            },
            editTestFinal: function(test) {
                if(this.editingTestIndex === -1) {
                    return this.tests.push(test);
                }
                this.tests[this.editingTestIndex] = test;
                this.updateTestsArray();
            },
            deleteTest: function(index) {
                this.tests.splice(index, 1);
            },
            throwError: function(msg) {
                this.error = msg;
                setTimeout(() => {
                    this.error = '';
                }, 2000);
            },
            saveGoogleAuthorizationInput: async function() {
                let projectId = this.$refs.projectIdInput.value;
                let language = this.$refs.languageInput.value;

                let data = JSON.stringify({
                    userId: this.$route.params.id,
                    projectId: projectId,
                    languageCode: language
                });

                let response = await this.$http.post('http://localhost:8008/authorization/google', data);
                if(response.status === 200) {
                    this.$router.push({path: '/ruben'});
                }
            },
            exitGoogleAuthorizationContainer: function() {
                this.$router.push({path: '/ruben'});
            }
        }
    }
</script>

<style lang="scss">

    /*html, body {*/
    /*min-height: 100vh;*/
    /*}*/

    .test-content-container {
        width: 100%;
        height: 93%;
        text-align: center;
        position: relative;
        margin: auto;

        .fade-enter-active, .fade-leave-active {
            transition: opacity .5s;
        }
        .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
        {
            opacity: 0;
        }

        .error {
            width: 25%;
            height: 6%;
            z-index: 10;
            position: absolute;
            top: 2%;
            left: 0;
            background-color: #FF353D;
            right: 0;
            margin: auto;
            border-radius: 5px;
            box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);

            span {
                width: 80%;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto;
                height: 58%;
                color: white;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
            }
        }

        .test-editor-overlay-container {
            width: 100%;
            height: 100%;
            display: none;
            position: absolute;
            top: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .google-authorization-input-overlay-container {
            width: 100%;
            height: 100%;
            z-index: 1000;
            position: absolute;
            top: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);

            .form-group {
                width: 50%;
                max-width: 340px;
                height: 30%;
                max-height: 180px;
                margin: auto;
                top: 0;
                bottom: 0;
                position: absolute;
                left: 0;
                right: 0;
                background-color: white;
                border-radius: 5px;

                .project-id-input-container {
                    height: 35%;
                    width: 70%;
                    position: absolute;
                    top: 5%;
                    bottom: 28%;
                    left: 0;
                    right: 0;
                    margin: auto;

                    label {
                        position: absolute;
                        left: 0;
                    }

                    input {
                        position: absolute;
                        width: 50%;
                        right: 0;

                    }
                }

                .language-input-container {
                    width: 70%;
                    height: 35%;
                    position: absolute;
                    top: 28%;
                    bottom: 5%;
                    left: 0;
                    right: 0;
                    margin: auto;

                    label {
                        position: absolute;
                        left: 0;
                    }

                    .language-input {
                        position: absolute;
                        width: 50%;
                        right: 0;
                    }

                }

                .exit-container {
                    position: absolute;
                    right: 3%;
                    top: 2%;
                    opacity: .3;
                    cursor: pointer;
                }

                button {
                    position: absolute;
                    bottom: 5%;
                }
            }
        }

        .test-editor-overlay-container.active {
            display: block;
        }

        .column-left, .column-right {
            height: 90%;
            width: 45%;
            max-width: 550px;
            max-height: 750px;
            display: inline-block;
            position: relative;
            margin: 2% 1%;
        }

        .column-left {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
        }
    }

</style>