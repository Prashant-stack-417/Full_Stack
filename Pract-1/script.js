const languages = [
  { Name: "JavaScript", votes: 0 },
  { Name: "Python", votes: 0 },
  { Name: "Java", votes: 0 },
];

const button = document.querySelector(".button");

function renderComponents() {
  button.innerHTML = languages
    .map(
      (languages) =>
        `<button onclick="handleClick('${languages.Name}')">${languages.Name} </button>`
    )
    .join("");

  const voteElement = document.querySelector(".votes");

  voteElement.innerHTML = languages
    .map(
      (languages) =>
        `<p>${languages.Name} : <span id = 'js_${languages.Name}'>${languages.votes} </span></p>`
    )
    .join("");
}

renderComponents();

window.handleClick = function (name) {
  const lang = languages.find((l) => l.Name === name);
  if (lang) {
    lang.votes += 1;
    const voteSpan = document.getElementById(`js_${lang.Name}`);
    if (voteSpan) {
      voteSpan.textContent = lang.votes;
    }
  }
};
