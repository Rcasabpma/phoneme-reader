function getPhonemes(word) {
  const url = `https://api.datamuse.com/words?sp=${word}&md=r&max=1`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0 || !data[0].tags) {
        showError("Sorry, this word wasn't found.");
        return;
      }

      const pronTag = data[0].tags.find(tag => tag.startsWith("pron:"));
      if (!pronTag) {
        showError("Phoneme data not available.");
        return;
      }

      const phonemeString = pronTag.replace("pron:", "");
      const phonemes = phonemeString.split(" ");

      const syllables = splitIntoSyllables(phonemes);
      displayAndSpeakSyllables(word, syllables);
    })
    .catch(() => {
      showError("Error contacting phoneme server.");
    });
}

function showError(message) {
  const output = document.getElementById("output");
  output.innerHTML = `<p style="color:red;">${message}</p>`;
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

  if (current.length > 0) {
    syllables[syllables.length - 1] = syllables[syllables.length - 1].concat(current);
  }

  return syllables;
}

function displayAndSpeakSyllables(word, syllables) {
  const output = document.getElementById("output");

  const readableSyllables = syllables.map(s => phonemesToChunk(s));

  output.innerHTML = readableSyllables
    .map(chunk => `<span class="phoneme">${chunk}</span>`)
    .join(" · ");

  speakWholeWord(word);

  readableSyllables.forEach((_, i) => {
    setTimeout(() => highlightPhoneme(i), i * 800);
  });

  setTimeout(() => {
    const spans = document.querySelectorAll(".phoneme");
    spans.forEach(span => span.classList.remove("active"));
  }, readableSyllables.length * 800);
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

function speakWholeWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(utterance);
}

function highlightPhoneme(index) {
  const spans = document.querySelectorAll(".phoneme");
  spans.forEach((span, i) => {
    span.classList.remove("active");
    if (i === index) {
      span.classList.add("active");
    }
  });
}

function soundOutWord() {
  const word = document.getElementById("wordInput").value.toLowerCase().trim();
  if (word === "") return showError("Please enter a word.");
  getPhonemes(word);
}
// Press Enter to sound out the word
document.getElementById("wordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    soundOutWord();
  }
});
