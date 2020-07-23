const baseUrl = "http://localhost:3000"

class User {
    static getAuthToken() {
        return localStorage.getItem('login_token')
    }

    static isAuthenticated() {
        if (User.getAuthToken() === 'undefined' || User.getAuthToken() === null) {
            return false
        }
        return true
    }

    static async signup(username, firstName, lastName, email, password) {
        const data = await createUserOrError(username, firstName, lastName, email, password)

        console.log(data)

        if (!data.user) {
            console.log(data.error)
            return { error: data.error }
        }
        else {
            localStorage.setItem('login_token', data.user.token)
            return { error: null, user: data.user.user }
        }
    }

    static async login(email, password) {
        const data = await getUserOrError(email, password)

        if (!data.user) {
            console.log(data.error)
            return { error: data.error }
        }
        else {
            localStorage.setItem('login_token', data.user.token)
            return { error: null, user: data.user.user }
        }
    }

    static async logout() {
        if (this.isAuthenticated()) {
            const token = this.getAuthToken()
            const status = await logOutUserOrError(token)
            if (!status.done) {
                console.log(status.error)
                return status
            }
            console.log(status.done)
            return status
        }
    }

    static async getPasswordList() {
        const data = await getAllPasswords(this.getAuthToken())
        if (!data.password) {
            console.log(data)
            return undefined
        }
        return await data.password
    }
}

class UI {
    static showLoginForm() {
        const formContainer = document.createElement('div')
        formContainer.innerHTML = `
         <form id="login_form">
        <div class="form-div">
            <label for="email">Email</label>
            <input type="text" name="email" id="email">
            <span id="input_error"> </span> 
        </div>
        <div class="form-div">
            <label for="password">Password</label>
            <input type="password" name="password" id="password">
        </div>
        <div class="form-div">
            <button class="login">login</button>
        </div>
    </form>
        `
        const mainContainer = document.querySelector('.container')
        mainContainer.innerHTML = ''
        mainContainer.appendChild(formContainer)
    }

    static showSignupForm() {
        const formContainer = document.createElement('div')
        formContainer.innerHTML = `
        <form id="signup_form">
        <div class="form-div">
            <label for="username">username</label>
            <input type="text" name="" id="username">
        </div>
        <div class="form-div">
            <label for="firstname">first name</label>
            <input type="text" name="" id="firstname">
        </div>
        <div class="form-div">
            <label for="lastname">lastname</label>
            <input type="text" name="", id="lastname">
        </div>
        <div class="form-div">
            <label for="email">Email</label>
            <input type="text" name="email" id="email">
        </div>
        <div class="form-div">
            <label for="password">Password</label>
            <input type="password" name="password" id="password">
        </div>
        <div class="form-div">
            <button class="login">login</button>
        </div>
    </form>
        `

        const mainContainer = document.querySelector('.container')
        mainContainer.innerHTML = ''
        mainContainer.appendChild(formContainer)
    }

    static async showPasswordList() {
        if (!User.isAuthenticated()) {
            return false
        }
        const passwds = await User.getPasswordList()
        const container = document.querySelector('.container')
        container.innerHTML = ''

        passwds.forEach(passwd => {
            const password = document.createElement('div')
            password.classList.add('password')
            password.innerHTML = `
            <div class="option">
                <div class="dot">.</div>
                <div class="dot">.</div>
                <div class="dot">.</div>
            </div>

            <div class="option-menu hidden">
                <div class="option-el"><a href="http://iamsatyam.com:8000">something</a></div>
                <div class="option-el"><a href="#">something</a></div>
                <div class="option-el"><a href="#">something</a></div>
            </div>

            <h3> ${passwd.name.toUpperCase()} <span> </span></h3>
            <br/>
            <div class="password-field">
                <input type="password" name="" value=${passwd.password}>
                <button class="clipboard-button">clipboard</button>
            </div>
        `
            container.appendChild(password)
        })
    }

    static showErrorMsg(msg, tp) {
        const errDiv = document.createElement('div')
        errDiv.className = `err err-${tp}`
        errDiv.textContent = msg
        const err_container = document.querySelector('.err-container')
        err_container.innerHTML = ''
        err_container.appendChild(errDiv)

        setTimeout(() => {
            errDiv.remove()
        }, 3000)
    }
}


class Password {

    static async addPassword(name, password) {
        const res = await fetch(`${baseUrl}/passwds`, {
            method: "POST",
            headers: { "Content-type": "application/json", Authorization: User.getAuthToken() },
            body: JSON.stringify({ name, password })
        })

        if (res.status !== 201) {
            return { error: 'something went wrong' }
        }
        else {
            main()
        }
    }

    static updatePassword() {

    }

    static removePassword() {

    }
}

async function createUserOrError(username, firstName, lastName, email, password) {
    try {
        const res = await fetch(`${baseUrl}/users`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ username, firstName, lastName, email, password })
        })
        if (res.status !== 201) {
            const data = await res.json()
            return { user: null, error: data.error }
        }

        const data = await res.json()
        return { user: data }
    }
    catch (error) {
        return { user: null, error: 'server error' }
    }
}

async function getUserOrError(email, password) {
    try {
        const res = await fetch(`${baseUrl}/users/login`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        if (res.status !== 200) {
            const data = await res.json()
            return { user: null, error: data.error }
        }
        const data = await res.json()
        return { user: data }
    }
    catch (error) {
        return { user: null, error: "server error" }
    }
}

async function logOutUserOrError(token) {
    try {
        const res = await fetch(`${baseUrl}/users/logout`, {
            method: "POST",
            headers: { "Content-type": "application/json", "Authorization": token },
        })

        if (res.status !== 200) {
            const data = await res.json()
            return { done: false, error: data }
        }
        localStorage.removeItem('login_token')
        return { done: true }
    } catch (error) {
        return { done: false, error }
    }
}

async function getAllPasswords(token) {
    try {
        const res = await fetch(`${baseUrl}/passwds`, {
            method: "GET",
            headers: { "Content-type": "application/json", "Authorization": token }
        })
        if (res.status !== 200) {
            const data = await res.json()
            return { password: null, error: data }
        }
        const data = await res.json()
        return { password: data }
    } catch (err) {
        return { password: null, error: err }
    }
}

function main() {
    if (User.isAuthenticated()) {

        const addContainer = document.querySelector('.add-container')
        addContainer.classList.remove('hidden')

        const addForm = document.querySelector('#add_form')
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            const name = e.target[0].value
            const password = e.target[1].value

            const status = await Password.addPassword(name, password)
            if (status) {
                UI.showErrorMsg(status.error, 'danger')
            }
            UI.showErrorMsg('added succesfully', 'success')
            e.target[0].value = ''
            e.target[1].value = ''
            console.log(status)

        })

        UI.showPasswordList()

        const login_button = document.querySelector('#login_button')
        const signup_button = document.querySelector('#signup_button')

        if (login_button) {
            login_button.remove()
        }
        if (signup_button) {
            signup_button.remove()
        }

        const userNameButton = document.createElement('span')
        userNameButton.classList.add('nav-button')
        userNameButton.id = "profile_button"
        userNameButton.textContent = 'profile'

        const logOutBtn = document.createElement('span')
        logOutBtn.classList.add('nav-button')
        logOutBtn.id = "logout_button"
        logOutBtn.textContent = 'logout'


        document.querySelector('.nav-links').appendChild(userNameButton)
        document.querySelector('.nav-links').appendChild(logOutBtn)

        logOutBtn.addEventListener('click', async (e) => {
            const status = await User.logout()
            if (status.done) {
                return main()
            }
        })
        console.log('main called')
    }

    else {
        document.querySelector('.add-container').classList.add('hidden')
        UI.showLoginForm()
        const login_button = document.createElement('span')
        login_button.classList.add('nav-button')
        login_button.id = "login_button"
        login_button.innerHTML = 'login'

        const signup_button = document.createElement('span')
        signup_button.classList.add('nav-button')
        signup_button.id = 'signup_button'
        signup_button.innerHTML = 'signup'

        const profile_button = document.querySelector('#profile_button')
        const logout_button = document.querySelector('#logout_button')

        let isUser = false
        signup_button.addEventListener('click', (e) => {
            UI.showSignupForm()
            document.querySelector('#username').addEventListener('input', async (e) => {
                if (e.target.value !== '') {
                    const res = await fetch(`${baseUrl}/users/checkusername/${e.target.value}`, { method: 'GET', headers: { "Content-type": "application/json" } })
                    const data = await res.json()
                    if (data.msg === false) {
                        isUser = true
                        UI.showErrorMsg('usename already exists', 'danger')
                    } else {
                        isUser = false
                    }
                }
            })

            const signup_form = document.querySelector('#signup_form')
            signup_form.addEventListener("submit", async (e) => {
                e.preventDefault()
                const username = e.target[0].value
                const firstname = e.target[1].value
                const lastname = e.target[2].value
                const email = e.target[3].value
                const password = e.target[4].value

                const status = await User.signup(username, firstname, lastname, email, password)

                if (status.error) {
                    UI.showErrorMsg(status.error, 'danger')
                    return console.log(status.error)
                }
                main()
            })
        })

        login_button.addEventListener('click', (e) => {
            UI.showLoginForm()
            main()
        })

        if (profile_button) {
            profile_button.remove()
        }
        if (logout_button) {
            logout_button.remove()
        }
        const nav_links = document.querySelector('.nav-links')
        nav_links.innerHTML = ''
        nav_links.appendChild(login_button)
        nav_links.appendChild(signup_button)

        const login_form = document.querySelector('#login_form')
        login_form.addEventListener("submit", async (e) => {
            e.preventDefault()
            const email = e.target[0].value
            const password = e.target[1].value

            const status = await User.login(email, password)
            if (status.error) {
                UI.showErrorMsg(status.error, 'danger')
                return console.log(status.error)
            }
            console.log('this one ')
            main()
        })


    }
}

main()