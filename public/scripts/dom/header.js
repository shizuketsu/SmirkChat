function addHeaderLink(href, str) {
    const li = document.createElement('li');
    hnavlist.appendChild(li);

    const a = document.createElement('a');
    a.textContent = str;
    a.href = href;
    li.appendChild(a);

    const hr = document.createElement('hr');
    li.appendChild(hr);
}

const header = document.getElementById('header');
const hcontainer = document.createElement('div');
hcontainer.className = 'container-900px';
header.appendChild(hcontainer);

const hbody = document.createElement('div');
hbody.className = 'header-body';
hcontainer.appendChild(hbody);

const hlogo = document.createElement('div');
hlogo.className = 'header-logo';
hbody.appendChild(hlogo);

const hlogoLink = document.createElement('a');
hlogoLink.href = '/';
hlogo.appendChild(hlogoLink);

const hlogoImg = document.createElement('img');
hlogoImg.src = './img/logo/main.png';
hlogoImg.alt = '';
hlogoLink.appendChild(hlogoImg);

const hlogoP = document.createElement('h4');
hlogoP.textContent = 'SmirkChat';
hlogoLink.appendChild(hlogoP);

const hnav = document.createElement('div');
hnav.className = 'header-nav';
hnav.id = 'menu';
hbody.appendChild(hnav);

const hnavtrue = document.createElement('nav');
hnav.appendChild(hnavtrue);

const hnavlist = document.createElement('ul');
hnavlist.className = 'header-list';
hnavtrue.appendChild(hnavlist);

addHeaderLink('/', 'Главная');
addHeaderLink('./updates.html', 'Обновления');
addHeaderLink('./blog.html', 'Блог');

const hlogin = document.createElement('li');
hlogin.className = 'header-log';
hlogin.id = 'auth-link';
hnavlist.appendChild(hlogin);

const hloginP = document.createElement('p');
hloginP.id = 'auth-p';
hloginP.textContent = 'Вход';
hlogin.appendChild(hloginP);

const hhamburger = document.createElement('div');
hhamburger.className = 'hamburger';
hhamburger.id = 'hamburger';
hbody.appendChild(hhamburger);

const hhamburgerSpan = document.createElement('span');
hhamburger.appendChild(hhamburgerSpan);