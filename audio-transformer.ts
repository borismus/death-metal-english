import {Jungle} from './jungle';

// Adapted from https://voicechanger.io/voicemaker/transformers/deepScaryTransformer.js
export async function deepScaryTransformer(audioBuffer: AudioBuffer, magnitude = 1): Promise<AudioBuffer> {
  let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

  // Source
  let source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  // Wobble
  let oscillator1 = ctx.createOscillator();
  oscillator1.frequency.value = -10;
  oscillator1.type = 'sawtooth';

  let oscillator2 = ctx.createOscillator();
  oscillator2.frequency.value = 50;
  oscillator2.type = 'sawtooth';

  let oscillator3 = ctx.createOscillator();
  oscillator3.frequency.value = 30;
  oscillator3.type = 'sawtooth';
  // ---
  let oscillatorGain = ctx.createGain();
  oscillatorGain.gain.value = 0.007;
  // ---
  let oscillatorGain2 = ctx.createGain();
  oscillatorGain2.gain.value = 0.007;
  // ---
  let delay = ctx.createDelay();
  delay.delayTime.value = 0.01;
  // ---
  let delay2 = ctx.createDelay();
  delay2.delayTime.value = 0.01;

  let filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2000;

  let compressor = ctx.createDynamicsCompressor();
  let compressor2 = ctx.createDynamicsCompressor();
  let compressor3 = ctx.createDynamicsCompressor();
  let compressor4 = ctx.createDynamicsCompressor();
  let compressor5 = ctx.createDynamicsCompressor();

  // Create graph
  oscillator1.connect(oscillatorGain);
  oscillator2.connect(oscillatorGain);
  // oscillator3.connect(oscillatorGain);
  oscillatorGain.connect(delay.delayTime);
  // ---
  source.connect(compressor2)
  compressor2.connect(delay);
  delay.connect(compressor3)
  compressor3.connect(filter);
  filter.connect(compressor5)

  oscillator3.connect(oscillatorGain2);
  oscillatorGain2.connect(delay2.delayTime);

  source.connect(compressor)
  compressor.connect(delay2);
  delay2.connect(compressor4)
  compressor4.connect(filter)
  filter.connect(compressor5);

  // SOURCE:
  let dryGain = ctx.createGain();
  source.connect(dryGain)
  dryGain.connect(ctx.destination);

  // TRANSFORMED:
  let wetGain = ctx.createGain();
  compressor5.connect(wetGain)
  wetGain.connect(ctx.destination);

  // MIX:
  dryGain.gain.value = 1 - magnitude;
  wetGain.gain.value = magnitude;

  // RENDER:
  oscillator1.start(0);
  oscillator2.start(0);
  oscillator3.start(0);
  source.start(0);

  let outputAudioBuffer = await ctx.startRendering();
  return outputAudioBuffer;
}

interface GiantMonsterOptions {
  osc1Freq?: number;
  osc1Type?: OscillatorType;
  osc2Freq?: number;
  osc2Type?: OscillatorType;
  osc3Freq?: number;
  osc3Type?: OscillatorType;
  gain1?: number;
  gain2?: number;
  gain3?: number;
  delay1?: number;
  delay2?: number;
  lowPass?: number;
}

export async function giantMonsterTransformer(audioBuffer: AudioBuffer, opts: GiantMonsterOptions = {}) {
  opts.osc1Freq = opts.osc1Freq == undefined ? -5 : opts.osc1Freq;
  opts.osc1Type = opts.osc1Type == undefined ? 'sawtooth' : opts.osc1Type;

  opts.osc2Freq = opts.osc2Freq == undefined ? 25 : opts.osc2Freq;
  opts.osc2Type = opts.osc2Type == undefined ? 'sawtooth' : opts.osc2Type;

  opts.osc3Freq = opts.osc3Freq == undefined ? 10 : opts.osc3Freq;
  opts.osc3Type = opts.osc3Type == undefined ? 'sawtooth' : opts.osc3Type;

  opts.gain1 = opts.gain1 == undefined ? 0.007 : opts.gain1;
  opts.gain2 = opts.gain2 == undefined ? 0.007 : opts.gain2;
  opts.gain3 = opts.gain3 == undefined ? 0.9 : opts.gain3;

  opts.delay1 = opts.delay1 == undefined ? 0.01 : opts.delay1;
  opts.delay2 = opts.delay2 == undefined ? 0.01 : opts.delay2;

  opts.lowPass = opts.lowPass == undefined ? 1000 : opts.lowPass;

  let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

  // Source
  let source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  // Wobble
  let oscillator1 = ctx.createOscillator();
  oscillator1.frequency.value = opts.osc1Freq;
  oscillator1.type = opts.osc1Type;

  let oscillator2 = ctx.createOscillator();
  oscillator2.frequency.value = opts.osc2Freq;
  oscillator2.type = opts.osc2Type;

  let oscillator3 = ctx.createOscillator();
  oscillator3.frequency.value = opts.osc3Freq;
  oscillator3.type = opts.osc3Type;
  // ---
  let oscillatorGain = ctx.createGain();
  oscillatorGain.gain.value = opts.gain1;
  // ---
  let oscillatorGain2 = ctx.createGain();
  oscillatorGain2.gain.value = opts.gain2;
  // ---
  let delay = ctx.createDelay();
  delay.delayTime.value = opts.delay1;
  // ---
  let delay2 = ctx.createDelay();
  delay2.delayTime.value = opts.delay2;

  let filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = opts.lowPass;

  // Reverb
  let convolver = ctx.createConvolver();
  convolver.buffer = await ctx.decodeAudioData(await (await fetch("parking-garage-ir.wav")).arrayBuffer());

  let compressor = ctx.createDynamicsCompressor();
  let compressor2 = ctx.createDynamicsCompressor();
  let compressor3 = ctx.createDynamicsCompressor();

  // Create graph
  oscillator1.connect(oscillatorGain);
  oscillator2.connect(oscillatorGain);
  // oscillator3.connect(oscillatorGain);
  oscillatorGain.connect(delay.delayTime);
  // ---
  source.connect(compressor2)
  compressor2.connect(delay);
  delay.connect(compressor3);
  compressor3.connect(filter);
  filter.connect(convolver)
  convolver.connect(ctx.destination);

  oscillator3.connect(oscillatorGain2);
  oscillatorGain2.connect(delay2.delayTime);

  let noConvGain = ctx.createGain();
  noConvGain.gain.value = opts.gain3;
  filter.connect(noConvGain);
  noConvGain.connect(ctx.destination);

  // source.connect(compressor)
  // compressor.connect(delay2);
  // delay2.connect(filter)
  // filter.connect(ctx.destination);

  //
  //filter.connect(ctx.destination);
  //compressor.connect(ctx.destination);

  // source.connect(delay);
  // delay.connect(filter);
  // filter.connect(ctx.destination);

  // Render
  oscillator1.start(0);
  oscillator2.start(0);
  oscillator3.start(0);
  source.start(0);
  // fire.start(0);
  let outputAudioBuffer = await ctx.startRendering();
  return outputAudioBuffer;

}


export async function baneTransform(audioBuffer: AudioBuffer) {
  let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  let source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  // Wave shaper
  let waveShaper = ctx.createWaveShaper();
  waveShaper.curve = makeDistortionCurve(7);
  function makeDistortionCurve(amount: number) {
    var k = typeof amount === 'number' ? amount : 50;
    var n_samples = 44100;
    var curve = new Float32Array(n_samples);
    var deg = Math.PI / 180;
    var x;
    for (let i = 0; i < n_samples; ++i) {
      x = i * 2 / n_samples - 1;
      curve[ i ] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Pitch
  let deeper = new Jungle(ctx);
  deeper.setPitchOffset(-0.6);

  // Telephone
  let lpf1 = ctx.createBiquadFilter();
  lpf1.type = "lowpass";
  lpf1.frequency.value = 5000.0;
  let lpf2 = ctx.createBiquadFilter();
  lpf2.type = "lowpass";
  lpf2.frequency.value = 5000.0;
  let hpf1 = ctx.createBiquadFilter();
  hpf1.type = "highpass";
  hpf1.frequency.value = 100.0;
  let hpf2 = ctx.createBiquadFilter();
  hpf2.type = "highpass";
  hpf2.frequency.value = 100.0;
  let compressor = ctx.createDynamicsCompressor();
  lpf1.connect(lpf2);
  lpf2.connect(hpf1);
  hpf1.connect(hpf2);
  hpf2.connect(waveShaper);


  source.connect(deeper.input);
  deeper.output.connect(lpf1);

  waveShaper.connect(compressor);
  compressor.connect(ctx.destination);

  source.start(0);
  return await ctx.startRendering();
}
