// Based on 
// A: Lazzarini, V. and Timoney, J. (2010) Theory and Practice of Modified Frequency Modulation Synthesis
//    Available at https://mural.maynoothuniversity.ie/4697/1/JAES_V58_6_PG459hirez.pdf
// B: Lazzarini, V. and Timoney, J. (2011) The ModFM Synthesis Vocoder
//    Available at http://hdl.handle.net/2027/spo.bbp2372.2011.119
class ModFmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
  }
  static get parameterDescriptors() {
    return [
      {
        // Formant centre frequency / Hz
        // 
        name: "ff",
        automationRate: "k-rate",
        defaultValue: 440,
        minValue: 10,
        maxValue: sampleRate/2,
      },
      {
        // Modulating frequency (comb spacing) / Hz
        name: "fm",
        automationRate: "k-rate",
        defaultValue: 110,
        minValue: 10,
        maxValue: sampleRate/2,
      },
      {
        // Bandwidth of formant / Hz
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
    const n_int = Math.floor(n);
    const n_frac = n - n_int;
    const g = Math.pow(2, -fm / parameters.B[0]);
    const k = 2 * g / ((g - 2) * g + 1);

    // Need fm, fshift, n_int, n_frac, k

    for (let i=0; i < output[0].length; i++) {
      // There are several implementations of this:
      //    Paper A Fig. 8 exp(k(cos(w0t)-1))*[(1-a)(cos(n(w0t+wst)))+a(cos((n+1)(w0t+wst)))]
      //    Paper A Eq. 15 exp(k(cos(w0t)-1))*[(1-a)(cos(n(w0t)+wst))+a(cos((n+1)(w0t)+wst))]
      //    Paper B Fig. 3 exp(k(cos(wt)-1))*[(1-a)(cos(nwt))+a(cos((n+1)wt))]
      // This is based on paper B Fig. 3.


      // Link between fc, f0, Bw
      // fc Carrier frequency
      // fm Modulator frequency
      // f0

      // Phase accumulator
      this.phase = (this.phase + fm / sampleRate) % 1;
      // Phase addition
      let phase_low = (n_int * this.phase) % 1;
      let phase_high = (phase_low + this.phase) % 1;
      // Sideband terms
      let cos_term_low = Math.cos(2 * Math.PI * phase_low);
      let cos_term_high_m_low = Math.cos(2 * Math.PI * phase_high) - cos_term_low;
      // Result
      let value = (
        Math.exp(k * (Math.cos(2 * Math.PI * this.phase) - 1))
        * (cos_term_low + n_frac * cos_term_high_m_low)
      );
      output.forEach((channel)=>{channel[i] = value;});
    }
    return true;
  }
}
registerProcessor("modfm-processor", ModFmProcessor);
