/**
 * @author grishkovelli unter https://github.com/grishkovelli/vue-audio-recorder
 *
 * Bearbeitet von Ruben Aegerter zur Anwendung für APIs
 */

export default class {
    constructor(options) {
        this.bufferSize = options.bufferSize || 4096
        this.sampleRate = options.sampleRate
        this.samples = options.samples
    }

    getData() {
        this._joinSamples()

        // change sample rate to 16000
        this.samples = interpolateArray(this.samples, 16000, this.sampleRate);
        this.sampleRate = 16000;

        let buffer = new ArrayBuffer(44 + this.samples.length * 2)


        let view = new DataView(buffer)

        this._writeString(view, 0, 'RIFF')                       // RIFF identifier
        view.setUint32(4, 36 + this.samples.length * 2, true)    // RIFF chunk length
        this._writeString(view, 8, 'WAVE')                       // RIFF type
        this._writeString(view, 12, 'fmt ')                      // format chunk identifier
        view.setUint32(16, 16, true)                             // format chunk length
        view.setUint16(20, 1, true)                              // sample format (raw)
        view.setUint16(22, 1, true)                              // channel count
        view.setUint32(24, this.sampleRate, true)                // sample rate
        view.setUint32(28, this.sampleRate * 4, true)            // byte rate (sample rate * block align)
        view.setUint16(32, 4, true)                              // block align (channel count * bytes per sample)
        view.setUint16(34, 16, true)                             // bits per sample
        this._writeString(view, 36, 'data')                      // data chunk identifier
        view.setUint32(40, this.samples.length * 2, true)        // data chunk length

        this._floatTo16BitPCM(view, 44, this.samples)

        return new Blob([view], {type: 'audio/wav'})
    }

    _floatTo16BitPCM(output, offset, input) {
        for(let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]))
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
        }
    }

    _joinSamples() {
        let recordLength = this.samples.length * this.bufferSize;
        let joinedSamples = new Float32Array(recordLength);
        let offset = 0;

        for(let i = 0; i < this.samples.length; i++) {
            let sample = this.samples[i];
            joinedSamples.set(sample, offset);
            offset += sample.length;
        }

        this.samples = joinedSamples;
    }

    _writeString(view, offset, string) {
        for(let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }
}


/**
 * Changes the set sample rate to a desird one.
 * @param data
 * @param newSampleRate
 * @param oldSampleRate
 * @returns {any[]}
 */
function interpolateArray(data, newSampleRate, oldSampleRate) {
    let fitCount = Math.round(data.length * (newSampleRate / oldSampleRate));
    let newData = new Array();
    let springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for(let i = 1; i < fitCount - 1; i++) {
        let tmp = i * springFactor;
        let before = new Number(Math.floor(tmp)).toFixed();
        let after = new Number(Math.ceil(tmp)).toFixed();
        let atPoint = tmp - before;
        newData[i] = linearInterpolate(data[before], data[after], atPoint);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    return newData;
}

function linearInterpolate(before, after, atPoint) {
    return before + (after - before) * atPoint;
}
