function addFooterLink(column, href, str) {
    const p = document.createElement('p');
    column.appendChild(p);

    const a = document.createElement('a');
    a.textContent = str;
    a.href = href;
    a.target = '_blank';
    p.appendChild(a);
}

const footer = document.getElementById('footer');
const fcontainer = document.createElement('div');
fcontainer.className = 'container-900px';
footer.appendChild(fcontainer);

const fbody = document.createElement('div');
fbody.className = 'footer-body';
fcontainer.appendChild(fbody);

const fcolumns = document.createElement('div');
fcolumns.className = 'footer-columns';
fbody.appendChild(fcolumns);

const fcolumn2 = document.createElement('div');
fcolumn2.className = 'footer-column';
fcolumns.appendChild(fcolumn2);

const fcolumn2header = document.createElement('h3');
fcolumn2header.textContent = 'Продукт';
fcolumn2.appendChild(fcolumn2header);

addFooterLink(fcolumn2, './terminology.html', 'Терминология');
addFooterLink(fcolumn2, './updates.html', 'Обновления');
addFooterLink(fcolumn2, 'https://github.com/shizuketsu/SmirkChat', 'GitHub');
addFooterLink(fcolumn2, '/auth', 'Авторизация');

const fcolumn1 = document.createElement('div');
fcolumn1.className = 'footer-column';
fcolumns.appendChild(fcolumn1);

const fcolumn1header = document.createElement('h3');
fcolumn1header.textContent = 'Команда';
fcolumn1.appendChild(fcolumn1header);

addFooterLink(fcolumn1, 'https://github.com/shizuketsu?tab=repositories', 'Проекты');
addFooterLink(fcolumn1, '#', 'О нас');
addFooterLink(fcolumn1, './blog.html', 'Блог');

const copyright = document.createElement('div');
fbody.appendChild(copyright);

const copyrighth3 = document.createElement('h3');
copyrighth3.textContent = 'SmirkChat © 2024';
copyright.appendChild(copyrighth3);