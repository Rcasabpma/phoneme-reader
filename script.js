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
      displayAndSpeakPhonemes(phonemes);
    })
    .catch(() => {
      showError("Error contacting phoneme server.");
    });
}

function showError(message) {
  const output = document.getElementById("output");
  output.innerHTML = `<p style="color:red;">${message}</p>`;
}

function displayAndSpeakPhonemes(phonemes) {
  const output = document.getElementById("output");
  output.innerHTML = phonemes.map(p => `<span class="phoneme">${p}</span>`).join("");

  phonemes.forEach((p, i) => {
    setTimeout(() => {
      speakPhoneme(p);
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

function soundOutWord() {
  const word = document.getElementById("wordInput").value.toLowerCase().trim();
  if (word === "") return showError("Please enter a word.");
  getPhonemes(word);
}
