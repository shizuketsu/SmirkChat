const changeBtns = document.querySelectorAll('.acc-changes-btn');
const modalWindow = document.querySelector('.acc-changes-modal-window');
const mwForm = document.querySelector('.acc-changes-form');
const closeModalWindow = document.getElementById('close-form-modal-window');
const sendModalWindow = document.getElementById('send-form-modal-window');
const strInput = document.getElementById('mv-str-input');
const passInput = document.getElementById('mv-pass-input');
const dimR = document.querySelector('.dim-overlayR');
const mwFormHeaderh2 = document.querySelector('.acc-changes-form-text h2');
const mwFormHeaderp = document.querySelector('.acc-changes-form-text p');
const accAvatar = document.getElementById('acc-prev-avatar');
const changeAvatarmw = document.getElementById('change-avatar-mv');
const closeChangeAvatarmw = document.getElementById('close-change-avatar-form');

let blockID;

changeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const parentBlock = btn.parentElement.parentElement.querySelector('div h3');
        const text = parentBlock ? parentBlock.textContent.trim() : '';

        switch(text) {
            case 'имя пользователя':
                strInput.placeholder = 'Новое имя';
                strInput.type = 'text';
                strInput.value = '';
                passInput.value = '';
                mwFormHeaderh2.textContent = 'Измените имя пользователя';
                mwFormHeaderp.textContent = 'Введите новое имя пользователя и пароль';

                blockID = 1;
                dimR.classList.add('active');
                modalWindow.classList.add('active');
                break;
            case 'дополнительная информация':
                strInput.placeholder = 'Новая информация';
                strInput.type = 'text';
                strInput.value = '';
                passInput.value = '';
                mwFormHeaderh2.textContent = 'Измените вашу информацию';
                mwFormHeaderp.textContent = 'Введите новое био и пароль';

                blockID = 2;
                dimR.classList.add('active');
                modalWindow.classList.add('active');
                break;
            case 'электронная почта':
                strInput.placeholder = 'Новая почта';
                strInput.type = 'text';
                strInput.value = '';
                passInput.value = '';
                mwFormHeaderh2.textContent = 'Измените почту';
                mwFormHeaderp.textContent = 'Введите новую почту и пароль';

                blockID = 3;
                dimR.classList.add('active');
                modalWindow.classList.add('active');
                break;
            case 'номер телефона':
                strInput.placeholder = 'Номер телефона';
                strInput.type = 'text';
                strInput.value = '';
                passInput.value = '';
                mwFormHeaderh2.textContent = 'Измените номер телефона';
                mwFormHeaderp.textContent = 'Введите новый номер и пароль';

                blockID = 4;
                dimR.classList.add('active');
                modalWindow.classList.add('active');
                break;
            case 'пароль':
                strInput.placeholder = 'Новый пароль';
                strInput.type = 'password';
                strInput.value = '';
                passInput.value = '';
                mwFormHeaderh2.textContent = 'Измените пароль';
                mwFormHeaderp.textContent = 'Введите новый и старый пароли';

                blockID = 5;
                dimR.classList.add('active');
                modalWindow.classList.add('active');
                break;
            default:
                break;
        }

        mwForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(passInput.value.lenght < 6) {
                return alert('Пароль должен содержать не меньше шести символов');
            } else if(!strInput.value) {
                return alert('Некорректное значение первого поля');
            }

            const r = await sendAccountData(strInput.value, passInput.value, blockID);
            console.log(r);

            if(String(r) !== '1') {
                alert(r);
            } else {
                location.reload();
            }
        });
    });
});

accAvatar.addEventListener('click', () => {
    changeAvatarmw.classList.add('active');
    dimR.classList.add('active');
});

closeChangeAvatarmw.addEventListener('click', () => {
    changeAvatarmw.classList.remove('active');
    dimR.classList.remove('active');
});

closeModalWindow.addEventListener('click', () => {
    modalWindow.classList.remove('active');
    dimR.classList.remove('active');
});
