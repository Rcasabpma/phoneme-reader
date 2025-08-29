function getPhonemesAndSyllables(word) {
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
      const syllables = groupPhonemesIntoSyllables(phonemes);

      displayAndSpeakSyllables(word, syllables);
    })
    .catch(() => {
      showError("Error contacting phoneme server.");
    });
}

// Approximate syllable grouping by breaking on vowels (simplified)
function groupPhonemesIntoSyllables(phonemes) {
  const vowels = ["AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY", "OW", "OY", "UH", "UW"];
  const syllables = [];
  let current = [];

  phonemes.forEach(p => {
    current.push(p);
    if (vowels.some(v => p.startsWith(v))) {
      syllables.push(current);
      current = [];
    }
  });

  if (current.length > 0) syllables[syllables.length - 1].push(...current);
  return syllables;
}

function displayAndSpeakSyllables(word, syllables) {
  const output = document.getElementById("output");

  output.innerHTML = syllables
    .map(s => `<span class="phoneme">${s.join(" ")}</span>`)
    .join(" · ");

  // Use proper pronunciation (not per syllable)
  speakWholeWord(word);

  // Highlight as spoken (optional)
  syllables.forEach((_, i) => {
    setTimeout(() => {
      highlightPhoneme(i);
    }, i * 1000);
  });
}

function speakWholeWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
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
  getPhonemesAndSyllables(word);
}
