function getPhonemesForSentence(sentence) {
  const words = sentence.toLowerCase().trim().split(/\s+/);
  const promises = words.map(word => getPhonemeData(word));

  Promise.all(promises).then(results => {
    const combinedOutput = [];
    const wordChunks = [];
    const errors = [];

    results.forEach((data, index) => {
      if (data.error) {
        errors.push(`"${words[index]}" not found`);
        return;
      }

      const syllables = splitIntoSyllables(data.phonemes);
      const readable = syllables.map(s => phonemesToChunk(s));
      wordChunks.push(readable);
      combinedOutput.push({ word: words[index], syllables: readable });
    });

    if (errors.length > 0) {
      showError(errors.join(", "));
      return;
    }

    displayAndSpeakSentence(combinedOutput);
  }).catch(() => {
    showError("Something went wrong fetching the words.");
  });
}

function getPhonemeData(word) {
  const url = `https://api.datamuse.com/words?sp=${word}&md=r&max=1`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0 || !data[0].tags) {
        return { error: true };
      }

      const pronTag = data[0].tags.find(tag => tag.startsWith("pron:"));
      if (!pronTag) return { error: true };

      const phonemeString = pronTag.replace("pron:", "");
      const phonemes = phonemeString.split(" ");
      return { phonemes };
    });
}

function splitIntoSyllables(phonemes) {
  const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
  const syllables = [];
  let current = [];

  phonemes.forEach(p => {
    current.push(p);
    const pBase = p.replace(/[0-9]/g, '');
    if (vowels.includes(pBase)) {
      syllables.push(current);
      current = [];
    }
  });

  if (current.length > 0 && syllables.length > 0) {
    syllables[syllables.length - 1] = syllables[syllables.length - 1].concat(current);
  } else if (current.length > 0) {
    syllables.push(current);
  }

  return syllables;
}

function phonemesToChunk(phonemeArray) {
  const phonemeToLetters = {
    TH: "Th", DH: "Th", SH: "Sh", CH: "Ch",
    B: "B", D: "D", F: "F", G: "G", HH: "H", JH: "J",
    K: "K", L: "L", M: "M", N: "N", NG: "Ng", P: "P",
    R: "R", S: "S", T: "T", V: "V", W: "W", Y: "Y", Z: "Z",
    AA: "a", AE: "a", AH: "u", AO: "aw", AW: "ow", AY: "eye",
    EH: "e", ER: "er", EY: "ay", IH: "i", IY: "ee",
    OW: "o", OY: "oy", UH: "oo", UW: "oo"
  };

  return phonemeArray
    .map(p => p.replace(/\d/g, ''))         // remove numbers
    .map(p => phonemeToLetters[p] || "")    // convert phoneme to readable letters
    .join("");
}

function displayAndSpeakSentence(sentenceChunks) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  const spanGroups = [];

  sentenceChunks.forEach((wordObj, wordIndex) => {
    const wordDiv = document.createElement("span");
    wordDiv.className = "word";

    const syllableSpans = wordObj.syllables.map((chunk, i) => {
      const span = document.createElement("span");
      span.className = "phoneme";
      span.textContent = chunk;
      wordDiv.appendChild(span);
      return span;
    });

    spanGroups.push(syllableSpans);
    output.appendChild(wordDiv);

    if (wordIndex !== sentenceChunks.length - 1) {
      const space = document.createTextNode(" ");


