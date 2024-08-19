// https://mural.maynoothuniversity.ie/4697/1/JAES_V58_6_PG459hirez.pdf
class ModFmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.f_phase = 0;
    this.m_phase = 0;
  }
  static get parameterDescriptors() {
    return [
      {
        name: "ff",
        automationRate: "k-rate",
        defaultValue: 440,
        minValue: 10,
        maxValue: sampleRate/2,
      },
      {
        name: "fm",
        automationRate: "k-rate",
        defaultValue: 110,
        minValue: 10,
        maxValue: sampleRate/2,
      },
      {
        name: "B",
        automationRate: "k-rate",
        defaultValue: 75,
        minValue: 0,
        maxValue: sampleRate/2,
      },
    ];
  }
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const ff = parameters.ff[0];
    const fm = parameters.fm[0];
    const n = ff / fm;
    const n_int = Math.floor(n_int);
    const n_frac = n - n_int;
    const g = Math.pow(2, -fm / parameters.B[0]);
    const k = 2 * g / ((g - 2) * g + 1);

    // Need fm, fshift, n_int, n_frac, k

    for (let i=0; i < output[0].length; i++) {
      // This is based on equation 14 of paper.
      // Note that this doesn't match Fig. 8.

      // Phase accumulators
      this.m_phase = (this.m_phase + fm / sampleRate) % 1;
      this.f_phase = (this.f_phase + ff / sampleRate) % 1;
      // Phase addition
      let phase_low = (n_int * this.f_phase + this.m_phase) % 1;
      let phase_high = (phase_low + this.f_phase) % 1;
      // Sideband terms
      let cos_term_low = Math.cos(2 * Math.PI * phase_low);
      let cos_term_high_m_low = Math.cos(2 * Math.PI * phase_high) - cos_term_low;
      // Result
      let value = (
        Math.exp(k * (Math.cos(2 * Math.PI * this.f_phase) - 1))
        * (cos_term_low + n_frac * cos_term_high_m_low)
      );
      output.forEach((channel)=>{channel[i] = value;});
    }
    return true;
  }
}
registerProcessor("modfm-processor", ModFmProcessor);
