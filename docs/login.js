const DEMO_ACCOUNTS = {
  admin: { identity: "admin@pottersville.demo", password: "demo1234", role: "admin", name: "Itunu Akinkugbe", email: "admin@pottersville.demo", className: "Administration" },
  teacher: { identity: "teacher@pottersville.demo", password: "demo1234", role: "teacher", name: "Akinkugbe Faith", email: "teacher@pottersville.demo", className: "Biology teacher" },
  student: { identity: "PVNT016", password: "demo1234", role: "student", name: "Amara Okafor", email: "student@pottersville.demo", className: "SS 1B" }
};

const form = document.getElementById("login-form");
const identityInput = document.getElementById("login-identity");
const passwordInput = document.getElementById("login-password");
const error = document.getElementById("login-error");

if (sessionStorage.getItem("pottersville-demo-session")) {
  window.location.replace("dashboard.html");
}

document.querySelectorAll("[data-demo-account]").forEach(button => {
  button.addEventListener("click", () => {
    const account = DEMO_ACCOUNTS[button.dataset.demoAccount];
    identityInput.value = account.identity;
    passwordInput.value = account.password;
    error.textContent = "";
    document.querySelectorAll("[data-demo-account]").forEach(item => item.classList.toggle("selected", item === button));
    identityInput.focus();
  });
});

document.getElementById("toggle-password").addEventListener("click", event => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  event.currentTarget.textContent = showing ? "Show" : "Hide";
  event.currentTarget.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

document.getElementById("reset-demo").addEventListener("click", () => {
  localStorage.removeItem("pottersville-demo-data");
  error.style.color = "#27815f";
  error.textContent = "Demo records have been restored to their original state.";
  window.setTimeout(() => { error.textContent = ""; error.style.color = ""; }, 3500);
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const identity = identityInput.value.trim().toLowerCase();
  const account = Object.values(DEMO_ACCOUNTS).find(item => item.identity.toLowerCase() === identity || item.email.toLowerCase() === identity);
  if (!account || passwordInput.value !== account.password) {
    error.style.color = "";
    error.textContent = "Those demo details do not match. Select one of the accounts above and try again.";
    return;
  }
  const session = { role: account.role, name: account.name, email: account.email, className: account.className, signedInAt: new Date().toISOString() };
  sessionStorage.setItem("pottersville-demo-session", JSON.stringify(session));
  window.location.assign("dashboard.html");
});
