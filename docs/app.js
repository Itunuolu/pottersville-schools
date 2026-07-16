const roles = {
  admin: { label: "Administrator", title: "Administration overview", name: "Itunu Akinkugbe", email: "Administrator", avatar: "IA" },
  teacher: { label: "Teacher", title: "Teaching workspace", name: "Akinkugbe Faith", email: "Biology teacher", avatar: "AF" },
  student: { label: "Student", title: "Student workspace", name: "Amara Okafor", email: "SS 1B student", avatar: "AO" }
};

let activeRole = "admin";
let activeSection = "overview";

const roleButtons = document.querySelectorAll("[data-role]");
const sectionButtons = document.querySelectorAll("[data-section]");
const panels = document.querySelectorAll(".demo-panel");

function renderDemo() {
  const role = roles[activeRole];
  document.getElementById("current-role-label").textContent = role.label;
  document.getElementById("workspace-title").textContent = activeSection === "overview" ? role.title : document.querySelector(`[data-section="${activeSection}"]`).textContent.trim();
  document.getElementById("user-name").textContent = role.name;
  document.getElementById("user-email").textContent = role.email;
  document.getElementById("avatar").textContent = role.avatar;
  roleButtons.forEach(button => button.classList.toggle("active", button.dataset.role === activeRole));
  sectionButtons.forEach(button => button.classList.toggle("active", button.dataset.section === activeSection));
  panels.forEach(panel => {
    const isOverview = activeSection === "overview" && panel.dataset.panel === `${activeRole}-overview`;
    const isSection = activeSection !== "overview" && panel.dataset.sectionPanel === activeSection;
    panel.classList.toggle("active", isOverview || isSection);
  });
}

roleButtons.forEach(button => button.addEventListener("click", () => {
  activeRole = button.dataset.role;
  activeSection = "overview";
  renderDemo();
}));

sectionButtons.forEach(button => button.addEventListener("click", () => {
  activeSection = button.dataset.section;
  renderDemo();
}));

document.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click", () => {
  activeSection = button.dataset.jump;
  renderDemo();
}));

const quiz = document.getElementById("quiz-form");
const scoreCard = document.getElementById("score-card");
const quizMessage = document.getElementById("quiz-message");

quiz.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(quiz);
  if (!["q1", "q2", "q3"].every(key => data.has(key))) {
    quizMessage.textContent = "Please answer all three questions before submitting.";
    quizMessage.style.color = "#a0622f";
    return;
  }
  const score = Number(data.get("q1") === "1") + Number(data.get("q2") === "0") + Number(data.get("q3") === "2");
  const percentage = Math.round((score / 3) * 100);
  document.getElementById("score-value").textContent = `${percentage}%`;
  document.getElementById("score-copy").textContent = score === 3 ? "You answered all three questions correctly." : `You answered ${score} of 3 questions correctly. Review the lesson note and try again.`;
  scoreCard.hidden = false;
  scoreCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("retry-quiz").addEventListener("click", () => {
  quiz.reset();
  scoreCard.hidden = true;
  quizMessage.textContent = "Answer every question before submitting.";
  quizMessage.style.color = "";
  quiz.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderDemo();
