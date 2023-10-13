export async function translateEnglishToDeathMetal(english: string): Promise<string> {
  const prompt = `You are the world's biggest fan of death metal music. You really love the melodies and rhythms and the fast pace. You are also tasked to be a translator from regular english to DEATH METAL ENGLISH. Death metal english has some common traits:

  1. Big, polysyllabic words
  2. Lots of adjectives
  3. Prepositional phrases, the more the better
  4. Passive voice: Active verbs aren’t brutal enough
  5. Archaic or pseudo-Biblical verbiage
  6. Grandiloquent metaphors
  7. Illogical or meaningless sentences

  Here are some examples of english translated into death metal english.

  English: Commuting to work
  Death Metal English: TRANSPORTATION OF THE WAGEBOUND UNTO THE NEXUS OF PERPETUAL QUOTIDIAN ENSLAVEMENT
  English: This bok choy isn’t very good
  Death Metal English: CASTIGATING THE VERDANT ISSUANCE OF THE SOILS OF JIANGNAN
  English: I need to take a nap
  Death Metal English: RIPPED INTO THE UTTER EXHAUSTION OF THE MIDDLE DAY
  English: Thanks for explaining the train schedule
  Death Metal English: PROFFERING GRATITUDE UPON THE CHRONOCRATION OF THE JUGGERNAUTS OF RETICULATED METALS AND FIRE
  English: You have to mow the lawn
  Death Metal English: BRING DOWN THE SCYTHE OF GODS UPON THE NECKS OF THE GREEN-RIBBED LEGIONS AND SWEEP AWAY THEIR WRETCHED BODIES; THOU ART IMPLORED BY ME
  English: ${english}
  Death Metal English:`;
  const translation = await callGPT4(prompt);
  return translation.toLowerCase();
}


export const DEFAULT_TEMPERATURE = 0.5;
const ENDPOINT_URL = 'https://us-central1-musemuse.cloudfunctions.net/openai_complete';

export async function callGPT4(prompt: string, {verbose = true} = {}) {
  if (!prompt) {
    throw new Error(`Prompt required.`);
  }
  const openAiKey = localStorage.getItem('openai_key');
  if (!openAiKey) {
    alert(`Please provide your OpenAI key first.`);
    throw new Error(`No OpenAI key specified.`);
  }
  const request = {
    // Assume the key is saved in storage by this point.
    openai_key: openAiKey,
    model: 'gpt-4',
    temperature: String(DEFAULT_TEMPERATURE),
    prompt,
  };
  if (verbose) {
    console.log(`[GPT] Request prompt "${prompt}"`);
  }
  const start = performance.now();
  const res = await fetch(ENDPOINT_URL + '?' + new URLSearchParams(request));
  const duration = performance.now() - start;

  if (res.status !== 200) {
    alert(`Error calling GPT. See console.`);
    throw new Error(`Error calling GPT: ${res.text}`);
  }

  const text = await res.text();
  if (verbose) {
    console.log(`[GPT] Response text "${text}"`);
  } else {
    console.log(`[GPT] Response: ${text.length} chars. Took ${Math.floor(duration)} ms.`);
  }

  return text;
}
