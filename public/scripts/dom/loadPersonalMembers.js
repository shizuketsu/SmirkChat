function addMember(userName1, uid) {
    const item = document.createElement('li');
    item.className = 'server-members-item';
    document.querySelector('.server-members-list').appendChild(item);

    const avatar = document.createElement('img');
    avatar.src = './img/users/' + uid + '.png';
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
    p.textContent = userName1;
    userName.appendChild(p);

    const icons = document.createElement('div');
    icons.className = 'server-members-item-icons';
    text.appendChild(icons);
}

async function loadPersonalMembers(key, user1Username, meUsername) {
    const users = {
        user1: {
            userName: user1Username,
            uid: key.split('|')[0]
        },
        me: {
            userName: meUsername,
            uid: key.split('|')[1]
        }
    }

    document.querySelector('.server-members-list').innerHTML = '';
    const h2 = document.createElement('h2');
    h2.textContent = 'Участники';
    document.querySelector('.server-members-list').appendChild(h2);

    addMember(users.user1.userName, users.user1.uid);
    addMember(users.me.userName, users.me.uid);
}