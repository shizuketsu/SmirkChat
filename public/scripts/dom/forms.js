const form = document.querySelector('.reg-form');
const email = document.getElementById('email');
const password = document.getElementById('pass');

const errorMsg = 'Ошибка: ';

function getNormalizeStr(str) {
    return str.replace(/ /g, '');
}

function sendError(msg, code) {
    alert(errorMsg + msg);
}

form.addEventListener('submit', (e) => {
    if(getNormalizeStr(email.value).length < 10) {
        sendError('Некорректный имейл', '1');
        e.preventDefault();
        return;
    } else if(!getNormalizeStr(email.value).includes('@gmail.com')) {
        sendError('Некорректный имейл', '1');
        e.preventDefault();
        return;
    } else if(getNormalizeStr(password.value).length < 6) {
        sendError('Пароль должен иметь хотя бы 6 символов', '2');
        e.preventDefault();
        return;
    }
});

const url = location.href.split('/');
const file = url[url.length - 1];

if(file === 'register') {
    document.getElementById('auth-btn').addEventListener('click', () => window.location.href = '/auth');
} else {
    document.getElementById('reg-btn').addEventListener('click', () => window.location.href = '/register');
}