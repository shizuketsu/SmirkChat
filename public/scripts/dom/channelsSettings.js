const settingBtn = document.getElementById('server-setting');
const membersBtn = document.getElementById('server-members');
const membersList = document.querySelector('.server-members-list-mw');
const settingsChannel = document.querySelector('.server-settings-mw');
const ownersettings = document.querySelector('.owner-server-settings-mw');
const dimRR = document.querySelector('.dim-overlayRR');
const dimRRRR = document.querySelector('.dim-overlayRRRR');
const dimRRRRR = document.querySelector('.dim-overlayRRRRR');
const exitChannel = document.getElementById('exit-channel');
const ownerSettingsBtn = document.getElementById('server-owner-settings');

settingBtn.addEventListener('click', () => {
    if (settingBtn.style.opacity == '0') return;

    settingsChannel.classList.add('active');
    dimRR.classList.add('active');
});

membersBtn.addEventListener('click', () => {
    membersList.classList.add('active');
    dimRRRR.classList.add('active');
});

ownerSettingsBtn.addEventListener('click', () => {
    ownersettings.classList.add('active');
    dimRRRRR.classList.add('active');
});

document.getElementById('sendServerChanges').addEventListener('click', async () => {
    const fdata = new FormData();

    const serverName = document.getElementById('server-name-settings');
    const desc = document.getElementById('server-desc-settings');
    const img = document.getElementById('change-server-avatar-input');

    fdata.append('name', serverName.value);
    fdata.append('desc', desc.value);
    fdata.append('img', img.files[0]);
    fdata.append('key', localStorage.getItem('keyOrUID'));

    await sendServerChanges(fdata);
    location.reload();
});

document.addEventListener('click', (event) => {
    if (!membersBtn.contains(event.target) && !document.querySelector('.server-members-list').contains(event.target)) {
        membersList.classList.remove('active');
        dimRRRR.classList.remove('active');
    }
});

document.addEventListener('click', (event) => {
    if (!settingBtn.contains(event.target) && !document.querySelector('.server-settings').contains(event.target)) {
        settingsChannel.classList.remove('active');
        dimRR.classList.remove('active');
    }
});

document.addEventListener('click', (event) => {
    if (!ownerSettingsBtn.contains(event.target) && !document.querySelector('.owner-server-settings').contains(event.target)) {
        ownersettings.classList.remove('active');
        dimRRRRR.classList.remove('active');
    }
});