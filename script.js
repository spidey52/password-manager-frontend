const baseUrl = "http://localhost:3000"
const login_button = document.querySelector('#login_button')


if (isAuthenticated()) {
    renderPasswords()
}
else {
    renderLoginPage()
}

optionBtn.forEach(item => {
    item.addEventListener('click', e => {
        optionMenu.forEach(item => {
            hideElement(item)
        })
        showElement(e.target.parentElement.parentElement.children[1])
    })
})

function showElement(el) {
    el.classList.remove('hidden')
}
function hideElement(el) {
    el.classList.add('hidden')
}

window.addEventListener('click', function (event) {
    if (!event.target.matches('.dot')) {
        optionMenu.forEach(item => {
            hideElement(item)
        })
        console.log('hidden')
    }
})

function isAuthenticated() {
    return localStorage.getItem('login_token')
}

function submitForm() {
    document.querySelector('form')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const email = e.srcElement[0].value
            const password = e.srcElement[1].value
            try {
                const res = await login(email, password)
                if (res.status !== 200) {
                    const data = await res.json()
                    const p = document.createElement('p')
                    p.innerHTML = data.error
                    const err_input = document.getElementById('input_error')
                    err_input.innerHTML = ''
                    err_input.appendChild(p)
                    return ''
                }
                const data = await res.json()

                console.log('data print')
                console.log(data)

                localStorage.setItem('login_token', data.token)
                getAllPasswords(data.token)
                renderPasswords()
            }
            catch (err) {
                console.log('error printing')
                console.log(err)
            }
        })
}

document.getElementById('logout_button')
    .addEventListener('click', async (e) => {
        if (!isAuthenticated()) {
            return alert('you must login first')
        }
        try {
            const res = await logout(isAuthenticated())
            const data = await res.json()
            console.log(data)
            localStorage.removeItem('login_token')
            renderLoginPage()
        } catch (error) {
            return console.log(error)
        }
    })

document.getElementById('logoutAll_button')
    .addEventListener('click', async (e) => {
        if (!isAuthenticated()) {
            return alert('you must login first')
        }
        try {
            const res = await logoutAll(isAuthenticated())
            const data = await res.json()
            localStorage.removeItem('login_token')
            console.log(data)
            renderLoginPage()
        } catch (error) {
            return console.log(error)
        }
    })


function login(email, password) {
    return fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email, password })
    })
}

function logout(token) {
    return fetch(`${baseUrl}/users/logout`, {
        method: "POST",
        headers: { "Content-type": "application/json", "Authorization": token },
    })
}

function logoutAll(token) {
    return fetch(`${baseUrl}/users/logoutAll`, {
        method: "POST",
        headers: { "Content-type": "application/json", "Authorization": token }
    })
}


async function getAllPasswords(token) {
    try {
        const res = await fetch(`${baseUrl}/passwds`, {
            method: "GET",
            headers: { "Content-type": "application/json", "Authorization": token }
        })
        return await res.json()
    } catch (err) {
        return err
    }
}

async function renderPasswords() {
    const data = await getAllPasswords(isAuthenticated())

    const container = document.querySelector('.container')
    container.innerHTML = ''

    data.forEach(passwd => {
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
    init()
}

function renderLoginPage() {
    document.querySelector('.container')
        .innerHTML = `
    <form>
        <div class="form-div">
            <label for="email">Email</label>
            <input type="text" name="email" id="email">
            <span id="input_error" > </span> 
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

    submitForm()
}

function init() {
    document.querySelectorAll('.clipboard-button').forEach(item => {
        item.addEventListener('click', e => {
            e.target.parentElement.children[0].select()
            document.execCommand('copy')
        })
    })
}

