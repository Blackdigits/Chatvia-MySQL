function checkCookie(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(cookieName + '=')) {
        return true; // Cookie found
      }
    }
    return false; // Cookie not found
}

function checkLocalStorageItem(key) {
    const value = localStorage.getItem(key);
    return value !== null;
}

const cookieName = 'logged';
const isCookiePresent = checkCookie(cookieName);
console.log(`Cookie "${cookieName}" is present: ${isCookiePresent}`);

const localStorageKey = 'currentUser';
const isLocalStorageValuePresent = checkLocalStorageItem(localStorageKey);
console.log(`Local Storage value for key "${localStorageKey}" is present: ${isLocalStorageValuePresent}`);

const auth_key = new URLSearchParams(window.location.search).get('auth_key');
if (auth_key) { // && !isCookiePresent
    const app_id = "22342555549952";
    const app_secret = "97a6f9e1b11edea3fd6cd3f33806eaae";
    const url = `https://onetouch.co.id/api/authorize?app_id=${app_id}&app_secret=${app_secret}&auth_key=${auth_key}`;

    document.querySelector(".loader").style.display = "block";
    document.querySelector(".loader_bg").style.display = "block";

    fetch(url)
    .then(response => response.json())
    .then(json => {
        if (json.access_token) {
          console.log(json);
          const access_token = json.access_token;
          const get_user_info_url = `https://onetouch.co.id/api/get_user_info?access_token=${access_token}`; 
        
            fetch(get_user_info_url)
                .then(response => response.json())
                .then(info => {
                const password = info.user_info.user_registered;
                const email = info.user_info.user_email;
                const name = info.user_info.user_name;
                const clientIP = info.user_info.currentIP;

                const signinFormData = new FormData();   

                signinFormData.append("location", clientIP);
                signinFormData.append("password", password);
                signinFormData.append("email", email);
                signinFormData.append("name", name);

                login(signinFormData);
            });
        } else {
            toastr.error(json.message, 'Error');
            document.querySelector(".loader").style.display = "none";
            document.querySelector(".loader_bg").style.display = "none";
        }
    });
}// else if (isCookiePresent && isLocalStorageValuePresent){ location.assign('/'); }

// Login
if (document.getElementsByClassName('form').length) {
    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault();
        var formElement = document.querySelector(".form");
        var formData = new FormData(formElement);
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        formData.append("email", email);
        formData.append("password", password);
        login(formData);
        document.querySelector(".loader").style.display = "block";
        document.querySelector(".loader_bg").style.display = "block";
    });
}

const login = async (formData) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signin',
            data: formData
        });
        if (res.data.status === 'fail') {
            toastr.error(res.data.message, 'Error');
            document.querySelector(".loader").style.display = "none";
            document.querySelector(".loader_bg").style.display = "none";
        }
        if (res.data.status === 'unregistered') {  
            register(formData);
        }
        if (res.data.status === 'success') {
            toastr.success(res.data.message, 'Success');
            localStorage.setItem('currentUser', JSON.stringify(res.data));
            window.setTimeout(() => {
                document.querySelector(".loader").style.display = "none";
                document.querySelector(".loader_bg").style.display = "none";
                location.assign('/');
            }, 1500);
        }
    }
    catch (err) {
        alert(err.response.data.message);
    }
};

// Register
if (document.getElementsByClassName('form--signup').length) {
    document.querySelector('.form--signup').addEventListener('submit', e => {
        e.preventDefault();

        var formElement = document.querySelector(".form--signup");
        var formData = new FormData(formElement);
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const location = document.getElementById('location').value;
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("location", location);
        register(formData);
        document.querySelector(".loader").style.display = "block";
        document.querySelector(".loader_bg").style.display = "block";
    });
}

const register = async (formData) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: formData,
        });
        if (res.data.status === 'fail') {
            document.querySelector(".loader").style.display = "none";
            document.querySelector(".loader_bg").style.display = "none";
            toastr.error(res.data.message, 'Error');
        }
        if (res.data.status === 'success') {
            toastr.success(res.data.message, 'Success');
            localStorage.setItem('currentUser', JSON.stringify(res.data));
            window.setTimeout(() => {
                document.querySelector(".loader").style.display = "none";
                document.querySelector(".loader_bg").style.display = "none";
                login(formData);
            }, 1500);
        }
    }
    catch (err) {
        document.querySelector(".loader").style.display = "none";
        document.querySelector(".loader_bg").style.display = "none";
        let text = "";
        const error = err.response.data.message;
        const errors = error.replace('User validation failed:', '').split(',');
        errors.forEach(myFunction);
        document.querySelector(".error_message").innerHTML = text;
        function myFunction(item, index) {
            text += `<div class="alert alert-danger alert-dismissible fade show" role="alert">${item}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>        
            `;
        }

    }
};

// Logout
if (document.getElementsByClassName('nav-logout').length) {
    document.querySelector('.nav-logout').addEventListener('click', async () => {
        logout();
    });
}

const logout = async () => {
    const res = await axios({
        method: 'GET',
        url: '/api/v1/users/logout',
    });
    location.assign('/login');
}

// Forgot Password
if (document.getElementsByClassName('forgot_pass').length) {
    document.querySelector('.forgot_pass').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        forgotPassword(email);
        document.querySelector(".loader").style.display = "block";
        document.querySelector(".loader_bg").style.display = "block";

    });
}

const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: { email },
        });

        if (res.data.status === 'fail') {
            toastr.error(res.data.message, 'Error');
            document.querySelector(".loader").style.display = "none";
            document.querySelector(".loader_bg").style.display = "none";

        }
        if (res.data.status === 'success') {
            const token = res.data.token;
            toastr.success(res.data.message, 'Success');
            document.querySelector(".loader").style.display = "none";
            document.querySelector(".loader_bg").style.display = "none";

        }
    }
    catch (err) {
        // alert(err.response.data.message);
        toastr.error('Please Provide a Email', 'Error');
    }
};

// Reset Password
if (document.getElementsByClassName('reset_pass').length) {
    document.querySelector('.reset_pass').addEventListener('submit', e => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        var url = window.location;
        var token = new URLSearchParams(url.search).get('token');
        resetPassword(password, token);
    });
}

const resetPassword = async (password, token) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/resetPassword/' + token,
            data: { password },
        });
        if (res.data.status === 'fail') {
            toastr.error(res.data.message, 'Error');
        }
        if (res.data.status === 'success') {
            toastr.success(res.data.message, 'Success');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500);
        }
    }
    catch (err) {
        toastr.error("Please Provide a Password", 'Error');
    }
};