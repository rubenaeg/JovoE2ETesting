import WavEncoder from './wav-encoder'

export default class {
    constructor(options = {}) {
        this.afterStop = options.afterStop
        this.micFailed = options.micFailed

        this.bufferSize = 4096
        this.records = []
        this.samples = []

        this.isRecording = false
    }

    start() {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(this.captureAudio.bind(this))
            .catch(this._micError.bind(this))
    }

    stop(emitAudioCallback) {
        this.stream.getTracks().forEach((track) => track.stop())
        this.input.disconnect()
        this.processor.disconnect()
        this.context.close()

        let encoder = new WavEncoder({
            bufferSize: this.bufferSize,
            sampleRate: 48000,
            samples: this.samples
        });

        let audioBlob = encoder.getData()
        let audioUrl = URL.createObjectURL(audioBlob)

        this.samples = []

        let reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = function() {
            emitAudioCallback(reader.result);
        };

        this.records.push({
            blob: audioBlob,
            url: audioUrl
        });

        if(this.afterStop) {
            this.afterStop()
        }
    }

    captureAudio(stream) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
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
        if(this.micFailed) {
            this.micFailed(error)
        }
    }
}