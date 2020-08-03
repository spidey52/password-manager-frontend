const baseUrl = "https://passwordmanagerapi.iamsatyam.com";
const blackback = document.querySelector(".blackback");

const addButton = document.getElementById("add-form");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const logoutButton = document.getElementById("logout-button");

const addFormContainer = document.querySelector(".add-container");
const loginFormContainer = document.querySelector("#login-form-container");
const signUpFormContainer = document.querySelector("#signup-form-container");

const auth = document.getElementById("auth");
const nauth = document.getElementById("nauth");

const addForm = document.querySelector("#add_form");
const loginForm = document.querySelector("#login_form");
const signupForm = document.querySelector("#signup_form");

let lastVisible;
let allPasswords;

const renderPassword = (id, pname, password) => {
  const pEl = document.createElement("div");
  pEl.className = "password card";
  pEl.innerHTML = `
    <h2> ${pname} </h2> 
     <div class="password-field">
        <input value="click to copy"> 
      </div>
      <div class="password-update">
        <button id="update" > update </button>
        <button id="delete" > delete </button>
      </div>
  `;
  const container = document.querySelector(".container");
  pEl.querySelector("input").addEventListener("click", (e) => {
    // console.log(e.target.value = password)
    e.target.value = password;
    e.target.select();
    document.execCommand("copy");
    e.target.value = "click to copy";
    UI.showSuccessMsg("password copied !");
  });

  pEl.querySelector("#delete").addEventListener("click", (e) => {
    deletePassword(id).then((data) => {
      if (!data) return console.log("something went wrong");
      renderAllPassword();
      return;
    });
  });

  // pEl.querySelector("#update").addEventListener("click", (e) => {
  //   const newPass = prompt("Enter new Password");
  //   if (newPass.trim() !== "") {
  //   console.log(newPass)
  //     updatePassword(id, newPass).then((data) => {
  //       if (!data) return console.log("unable to update");
  //       showSuccessMsg("password updated succesfully");
  //       renderAllPassword();
  //     });
  //   }
  // });
  pEl.querySelector("#update").addEventListener('click', (e) => {
    alert('i am working on this one.')
  })
  container.append(pEl);
};

const renderAllPassword = () => {
  if (User.isAuthenticated()) {
    getAllPassword().then((data) => {
      document.querySelector(".container").innerHTML = "";
      if (data.length === 0)
        document.querySelector(
          ".container"
        ).innerHTML = `<h2> There is no password addd a new one.`;
      data.forEach((element) => {
        renderPassword(element._id, element.name, element.password);
      });
    });
  } else {
    loginForm.addEventListener("submit", User.loginFormHandler);
    document.querySelector(
      ".container"
    ).innerHTML = `<h2 > You are not Logged In. </h2>`;
  }
};

class User {
  static getAuthToken() {
    return localStorage.getItem("token");
  }
  static isAuthenticated() {
    if (this.getAuthToken() === "undefined" || this.getAuthToken() === null)
      return false;

    return true;
  }

  static signupHandler(e) {
    e.preventDefault();
    const username = e.target.username;
    const firstName = e.target.firstname;
    const lastName = e.target.firstname;
    const email = e.target.email;
    const password = e.target.password;

    createUser(
      username.value,
      firstName.value,
      lastName.value,
      email.value,
      password.value
    ).then((user) => {
      console.log(user);
      if (!user.token) {
        return console.log("something went wrong.");
      }
      localStorage.setItem("token", user.token);
      username.value = "";
      firstName.value = "";
      lastName.value = "";
      password.value = "";
      lastVisible.classList.remove("visible");
      blackback.classList.remove("visible");
      UI.renderNav();
      renderAllPassword();
      return;
    });
  }

  static loginFormHandler(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    getUserLogin(email, password).then((user) => {
      if (user.user !== null) {
        console.log(user.user);
        localStorage.setItem("token", user.token);
        e.target.email.value = "";
        e.target.password.value = "";
        lastVisible.classList.remove("visible");
        blackback.classList.remove("visible");
        UI.renderNav();
        renderAllPassword();
        return;
      }
      return console.log("something went wrong.");
    });
  }

  static logoutHandler(e) {
    getUserLogout().then((data) => {
      if (!data) {
        return console.log("something went wrong.");
      }
      localStorage.removeItem("token");
      UI.renderNav();
      renderAllPassword();
      return console.log("logged out succesfully.");
    });
  }

  static addPasswordHandler(e) {
    e.preventDefault();
    const name = e.target.name;
    const password = e.target.password;
    createPassword(name.value, password.value).then((data) => {
      if (!data) return console.log("something went wrong.");
      name.value = "";
      password.value = "";
      document.querySelector(".add-container").classList.remove("visible");
      blackback.classList.remove("visible");
      renderAllPassword();
      return;
    });
  }
}

class UI {
  static renderAuthenticated() {
    auth.classList.remove("hidden");
    nauth.classList.add("hidden");
  }

  static renderNotAuthenticated() {
    auth.classList.add("hidden");
    nauth.classList.remove("hidden");
  }
  static renderNav() {
    if (User.isAuthenticated()) this.renderAuthenticated();
    else this.renderNotAuthenticated();
  }

  static showSuccessMsg(msg) {
    const msgContainer = document.querySelector(".msg-container");
    msgContainer.innerHTML = `
      <span class="err err-success" > ${msg} </span> 
    `;
    setTimeout(() => {
      msgContainer.innerHTML = "";
    }, 800);
  }
}

UI.renderNav();
renderAllPassword();
logoutButton.addEventListener("click", User.logoutHandler);
signupForm.addEventListener("submit", User.signupHandler);
addForm.addEventListener("submit", User.addPasswordHandler);

addButton.addEventListener("click", () => {
  document.querySelector(".add-container").classList.add("visible");
  blackback.classList.add("visible");
  lastVisible = addFormContainer;
});

loginButton.addEventListener("click", () => {
  loginFormContainer.classList.add("visible");
  blackback.classList.add("visible");
  lastVisible = loginFormContainer;
});

signupButton.addEventListener("click", () => {

  signUpFormContainer.classList.add("visible");
  blackback.classList.toggle("visible");
  lastVisible = signUpFormContainer;
});

blackback.addEventListener("click", (e) => {
  e.target.classList.toggle("visible");
  document.body.style.overflow = 'auto'
  lastVisible.classList.remove("visible");
});

// fetching data from api
async function getAllPassword() {
  const url = baseUrl + "/passwds";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: User.getAuthToken(),
    },
  });
  if (res.status !== 200) {
    throw new Error("something went wrong");
  }
  return await res.json();
}

async function createPassword(name, password) {
  const url = baseUrl + "/passwds";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: User.getAuthToken(),
    },
    body: JSON.stringify({ name, password }),
  });

  if (res.status !== 201) {
    return false;
  }
  return await res.json();
}

async function deletePassword(id) {
  const url = baseUrl + "/passwds";
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      Authorization: User.getAuthToken(),
    },
    body: JSON.stringify({ _id: id }),
  });

  if (res.status !== 200) {
    console.log("soemthing went wrong");
    return false;
  }
  console.log("hurray you did it!");
  return true;
}

async function updatePassword(id, password) {
  const url = baseUrl + "/passwds";
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      Authorization: User.getAuthToken(),
    },
    body: JSON.stringify({ _id: id, password: password }),
  });

  if (res.json() !== 200) {
    console.log("something went wrong");
    return false;
  }
  console.log("succesfully updated");
  return true;
}

async function getUserLogin(email, password) {
  const url = baseUrl + "/users/login";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (res.status !== 200) return { user: null, error: "something went wrong" };

  return await res.json();
}

async function getUserLogout() {
  const url = baseUrl + "/users/logout";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: User.getAuthToken(),
    },
  });
  if (res.status !== 200) return false;
  return true;
}

async function createUser(username, firstName, lastName, email, password) {
  const url = baseUrl + "/users";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, firstName, lastName, email, password }),
  });

  if (res.status !== 201) return { token: null, error: "something went wrong" };
  // console.log(await res.json().user);
  const data = await res.json();

  console.log(data.token);
  return { user: data.user, token: data.token };
}
