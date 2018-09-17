import WavEncoder from './wav-encoder'

export default class {
    constructor() {
        this.samples = [];
    }

    start() {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(this.captureAudio.bind(this))
            .catch(this._micError.bind(this))
    }

    stop(emitAudioCallback) {
        this.stream.getTracks().forEach((track) => track.stop());
        console.log(this.stream.getTracks());
        this.input.disconnect();
        this.processor.disconnect();
        this.context.close();

        let encoder = new WavEncoder({
            bufferSize: 4096,
            sampleRate: 48000,
            samples: this.samples
        });

        let audioBlob = encoder.getData();

        let reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = function() {
            emitAudioCallback(reader.result);
        };
    }

    captureAudio(stream) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        /* Create a MediaStreamAudioDestinationNode associated with a MediaStream captured when mounting
         * the app, used to capture the incoming audio from the microphone.
         */
        this.input = this.context.createMediaStreamSource(stream);
        this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1);
        this.stream = stream;

        this.processor.onaudioprocess = (ev) => {
            let sample = ev.inputBuffer.getChannelData(0);
            this.samples.push(new Float32Array(sample));
        };

        this.input.connect(this.processor)
        this.processor.connect(this.context.destination)
    }

    _micError(error) {
        console.log(error);
    }
}