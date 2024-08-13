var ctx = new AudioContext();
var createNote = function(freq, offset) {
    var attack = 0.01;
    var decay = 0.03;
    var sustain = 0.3;
    var release = 0.8;
    var start = ctx.currentTime + (offset || 0);

}

class ModFMProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: "frequency",
                defaultValue: 1000,
                minValue: 10,
                maxValue: 4000
            }, {
                name: "ratio",
                defaultValue: 0.1,
                minValue: 0.1,
                maxValue: 2
            }, {
                name: "k",
                defaultValue: 1,
                minValue: 0,
                maxValue: 35
            }, {
                name: "r",
                defaultValue: 1,
                minValue: 0,
                maxValue: 1
            }, {
                name: "s",
                defaultValue: 0,
                minValue: -1,
                maxValue: 1
            }
        ];
    }
    constructor() {
        super();
        this.carrier_phase = 0;
        this.modulator_phase = 0;
    }
    process(inputs, outputs, params) {
        let frequency = params.frequency;
        let mod_frequency = frequency * params.ratio;
        let k = params.k;
        let r = params.r;
        let s = params.s;
        let quantumSize = outputs[0][0].length;
        let tau = 2 * Math.PI;
        for (let i=0; s<quantumSize; s++) {
            for (let o=0; o<outputs.length; o++) {
                this.carrier_phase = (this.carrier_phase + frequency / sampleRate) % 1;
                this.modulator_phase = (this.modulator_phase + mod_frequency / sampleRate) % 1;
                let value = (
                    Math.exp(r * k * (Math.cos(tau * this.modulator_phase)-1))
                    * Math.cos(this.carrier_phase + s * k * Math.sin(tau * this.modulator_phase))
                );
                for (let ch=0; ch<outputs[0].length; ch++) {
                    outputs[o][ch][i] = value;
                }
            }
        }
        return true;
    }
}

registerProcessor('phasor-processor', ModFMProcessor);