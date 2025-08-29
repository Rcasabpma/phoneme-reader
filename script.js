// Simple dictionary of phonemes for a few example words
const phonemeDict = {
  "cat": ["k", "æ", "t"],
  "dog": ["d", "ɔ", "g"],
  "read": ["r", "iː", "d"],
  "hello": ["h", "ə", "l", "oʊ"],
  "apple": ["æ", "p", "əl"]
};

function speakPhoneme(phoneme, delay) {
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(phoneme);
    speechSynthesis.speak(utterance);
  }, delay);
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
  const word = document.getElementById("wordInput").value.toLowerCase();
  const output = document.getElementById("output");

  if (!phonemeDict[word]) {
    output.innerHTML = `<p style="color:red;">Sorry, this word isn't in the demo dictionary yet.</p>`;
    return;
  }

  const phonemes = phonemeDict[word];
  output.innerHTML = phonemes.map(p => `<span class="phoneme">${p}</span>`).join("");

  phonemes.forEach((p, i) => {
    speakPhoneme(p, i * 1000); // delay each by 1s
    setTimeout(() => highlightPhoneme(i), i * 1000);
  });
}
