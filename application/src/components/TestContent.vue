<template>
    <div class="test-content-container">
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
            <test-editor @showTestEditor="showTestEditor" @editTestFinal="editTestFinal"
                         :test-to-edit="testToEdit"/>
        </div>
    </div>
</template>
<script>
    import TestPreview from './TestPreview'
    import TestList from './TestList'
    import TestEditor from './TestEditor'
    // import TestsStore from '../store/TestsStore'

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
                                text: 'New Test',
                                audio: ''
                            },
                            response: {
                                text: {
                                    expected: '',
                                    actual: ''
                                },
                                audio: ''
                            }
                        }
                    ],
                    platforms: ['alexa', 'google']
                },
                editing: false,
                editingTest: 0
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
            updateConversationStatus: function(status, testIndex, conversationIndex) {
                this.tests[testIndex].conversations[conversationIndex].status = status;
                this.updateTestsArray();
                this.updatePreview();
            },
            updateTestResponseContent: function(responseBody, testIndex, conversationIndex) {
                this.tests[testIndex].conversations[conversationIndex].response.audio = responseBody.audioContent;
                this.tests[testIndex].conversations[conversationIndex].response.text.actual = responseBody.audioText;
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
                                audio: ''
                            }
                        }
                    ],
                    platforms: ['alexa', 'google']
                };
                this.editing = false;
                this.showTestEditor(true);
            },
            updatePreview: function() {
                this.$refs.preview.$forceUpdate();
            },
            editTest: function(index) {
                this.selectedTest = index;
                this.testToEdit = this.tests[index];
                this.editing = true;
                this.editingTest = index;
                this.showTestEditor(true);
            },
            editTestFinal: function(test) {
                if(!this.editing) {
                    console.log('Adding new Test!');
                    return this.tests.push(test);
                }
                console.log('Editing Test');
                this.tests[this.editingTest] = test;
                this.updateTestsArray();
            },
            deleteTest: function(index) {
                this.tests.splice(index, 1);
            }
        }
    }
</script>

<style lang="scss">

    html, body {
        min-height: 100vh;
    }

    .test-content-container {
        width: 100%;
        height: 93%;
        text-align: center;
        position: relative;
        margin: auto;

        .test-editor-overlay-container {
            width: 100%;
            height: 100%;
            display: none;
            position: absolute;
            top: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .test-editor-overlay-container.active {
            display: block;
        }

        .column-left, .column-right {
            height: 90%;
            width: 45%;
            position: absolute;
            margin: auto;
            top: 0;
            bottom: 0;
        }

        .column-left {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);
            left: 3%;
        }

        .column-right {
            right: 3%;
        }
    }

</style>