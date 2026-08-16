function init() {
  setupEventListeners();
}

function setupEventListeners() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // verhindert Neuladen der Seite
    const loginUserData = getLoginFormValues();
    try {
      const user = await loginWithEmail(
        loginUserData.email,
        loginUserData.password,
      );
      // Erfolg: Status speichern, Redirect
    } catch (error) {
      // Fehler: loginError befüllen
    }
  });
}

function getLoginFormValues() {
  let inputEmail = document.getElementById("exampleInputEmail1").value;
  let inputPassword = document.getElementById("exampleInputPassword1").value;
  let loginUserData = {
    email: inputEmail,
    password: inputPassword,
  };
  console.log(loginUserData);
  return loginUserData;
}
