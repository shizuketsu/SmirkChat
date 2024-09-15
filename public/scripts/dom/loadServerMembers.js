async function loadServerMembers(sid) {
    const r = await getServerMembers(sid);
    const result = r.split('|');
    const members = result[0].split(';');
    const owner = result[1];

    document.querySelector('.server-members-list').innerHTML = '';
    const h2 = document.createElement('h2');
    h2.textContent = 'Участники';
    document.querySelector('.server-members-list').appendChild(h2);

    for(let i = 0; i < members.length; i++) {
        if(!members[i]) continue;

        const member = await getProfileInfo(String(members[i]));
        const item = document.createElement('li');
        item.className = 'server-members-item';
        document.querySelector('.server-members-list').appendChild(item);

        const avatar = document.createElement('img');
        avatar.src = './img/users/' + members[i] + '.png';
        avatar.alt = '';
        avatar.className = 'server-members-avatar';
        item.appendChild(avatar);

        const text = document.createElement('div');
        text.className = 'server-members-item-text';
        item.appendChild(text);

        const userName = document.createElement('div');
        userName.className = 'server-members-item-username';
        text.appendChild(userName);

        const p = document.createElement('p');
        p.textContent = member.userName;
        userName.appendChild(p);

        const icons = document.createElement('div');
        icons.className = 'server-members-item-icons';
        text.appendChild(icons);

        if(members[i] == owner) {
            const icon = document.createElement('img');
            icon.src = './img/icons/owner.png';
            icon.alt = '';
            icons.appendChild(icon);
        }
    }
}