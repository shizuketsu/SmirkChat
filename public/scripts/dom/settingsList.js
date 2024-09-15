const settingsList = document.querySelector('.settings-list');

function addSettingsLink(href, str) {
    const li = document.createElement('li');
    settingsList.appendChild(li);

    const a = document.createElement('a');
    a.textContent = str;
    a.href = href;
    li.appendChild(a);
}

addSettingsLink('./channels', 'Мои каналы');
addSettingsLink('./account', 'Моя учётная запись');
addSettingsLink('./friends', 'Друзья');
addSettingsLink('./settings', 'Настройки');
addSettingsLink('./exit', 'Выйти');