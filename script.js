function getSyllables(word) {
  const url = `https://api.datamuse.com/words?sp=${word}&md=s&max=1`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0 || !data[0].numSyllables) {
        showError("Syllables not found for this word.");
        return;
      }

      const syllableCount = data[0].numSyllables;
      const syllables = splitWordIntoParts(word, syllableCount);
      displayAndSpeakSyllables(syllables);
    })
    .catch(() => {
      showError("Error fetching syllables.");
    });
}

function splitWordIntoParts(word, syllableCount) {
  if (syllableCount <= 1 || word.length <= syllableCount) return [word];

  const avgLength = Math.floor(word.length / syllableCount);
  const syllables = [];

  for (let i = 0; i < syllableCount; i++) {
    const start = i * avgLength;
    const end = (i === syllableCount - 1) ? word.length : (i + 1) * avgLength;
    syllables.push(word.slice(start, end));
  }

  return syllables;
}

function displayAndSpeakSyllables(syllables) {
  const output = document.getElementById("output");
  output.innerHTML = syllables.map(s => `<span class="phoneme">${s}</span>`).join("·");

  syllables.forEach((s, i) => {
    setTimeout(() => {
      speakPhoneme(s);
      highlightPhoneme(i);
    }, i * 1000);
  });
}

function speakPhoneme(phoneme) {
  const utterance = new SpeechSynthesisUtterance(phoneme);
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

function showError(message) {
  const output = document.getElementById("output");
  output.innerHTML = `<p style="color:red;">${message}</p>`;
}

function soundOutWord() {
  const word = document.getElementById("wordInput").value.toLowerCase().trim();
  if (word === "") return showError("Please enter a word.");
  getSyllables(word); // 👈 This now gets syllables instead of phonemes
}

