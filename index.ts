import {baneTransform} from './audio-transformer';
import {translateEnglishToDeathMetal} from './translate';

const buttonEl = document.querySelector('button')!;
const englishEl = document.querySelector('textarea#english') as HTMLInputElement;
const deathMetalEl = document.querySelector('div#death-metal') as HTMLDivElement;
const openAiKeyEl = document.querySelector('input#openai-key') as HTMLInputElement;

const FADE_TIME = 1;


// Save OpenAI key to localStorage whenever we blur the element.
openAiKeyEl.addEventListener('blur', e => localStorage.setItem('openai_key', openAiKeyEl.value));

document.addEventListener('DOMContentLoaded', () => {
  openAiKeyEl.value = localStorage.getItem('openai_key')!;
});

buttonEl.addEventListener('click', main);

const audioContext = new AudioContext();

async function main() {
  const english = englishEl.value;
  if (!english) {
    throw new Error('No text!');
  }
  startBackingTrack();

  deathMetalEl.innerText = '...';

  // First translate into death metal english.
  const deathMetal = await translateEnglishToDeathMetal(english);
  // deathMetalEl.innerText = deathMetal;

  const {base64Audio, wordTimings} = await textToSpeechBase64(deathMetal);
  console.log(wordTimings);

  const words = deathMetal.split(' ');
  scheduleWordsAndTimings(words, wordTimings);

  const arrayBuffer = base64ToArrayBuffer(base64Audio);

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const transformedAudioBuffer = await baneTransform(audioBuffer);

  playAudioBuffer(transformedAudioBuffer);
  stopBackingTrackAfter(transformedAudioBuffer.duration);
}

function scheduleWordsAndTimings(words: string[], wordTimings: number[]) {
  if (words.length != wordTimings.length) {
    console.warn(`|words| = ${words.length} != |wordTimings| = ${wordTimings.length}`);
  }
  deathMetalEl.innerText = '';
  for (const [ ind, word ] of words.entries()) {
    const second = wordTimings[ ind ];
    setTimeout(() => {
      deathMetalEl.innerText += ` ${word}`;
    }, second * 1000);
  }
}

interface TTSResults {
  base64Audio: string;
  wordTimings: number[];
}

async function textToSpeechBase64(text: string): Promise<TTSResults> {
  const wordsWithMarks = text.split(' ')
    .map((word, index) => `<mark name="${index}"/>${word}`)
    .join(' ');
  console.log(wordsWithMarks);
  const requestParams = {
    "audioConfig": {
      "audioEncoding": "MP3",
      "sampleRateHertz": 16000,
      "speakingRate": 0.8,
    },
    "input": {
      // "text": text
      "ssml": `<speak>${wordsWithMarks}</speak>`
    },
    "voice": {
      "languageCode": "en-US"
    },
    "enableTimePointing": [
      "SSML_MARK"
    ]
  };

  const key = 'AIzaSyDOi68xAua2Jt1M4BR5M8DjNeoyMzSWmuY';
  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?alt=json&key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestParams)
  });
  const responseJson = await response.json();
  console.log(responseJson);

  const wordTimings = responseJson.timepoints.map((tp: any) => tp.timeSeconds);

  // Base64 encoded speech is here: responseJson.audioContent.
  return {base64Audio: responseJson.audioContent, wordTimings};
}

// Cribbed from https://stackoverflow.com/a/21797381
function base64ToArrayBuffer(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[ i ] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}


function playAudioBuffer(audioBuffer: AudioBuffer) {
  // Get an AudioBufferSourceNode.
  // This is the AudioNode to use when we want to play an AudioBuffer
  const source = audioContext.createBufferSource();

  // set the buffer in the AudioBufferSourceNode
  source.buffer = audioBuffer;

  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(audioContext.destination);

  // start the source playing
  source.start();
}

const backingAudio = new Audio('backing.mp3');
backingAudio.load();
let gainNode: GainNode;

const source = audioContext.createMediaElementSource(backingAudio);
gainNode = audioContext.createGain();
source.connect(gainNode);
gainNode.connect(audioContext.destination);

function startBackingTrack() {
  backingAudio.play();
  gainNode.gain.setValueAtTime(0.0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + FADE_TIME);
}

function stopBackingTrackAfter(duration: number) {
  gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + duration);
  gainNode.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + duration + FADE_TIME);
}