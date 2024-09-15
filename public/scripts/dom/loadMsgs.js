class Messages {
    constructor() {
        this.msgsList = document.querySelector('.messages-list');
        this.dim = document.querySelector('.dim-overlayRRR');
        this.profile = document.querySelector('.user-channel-profile-mw');
        this.profileContent = document.querySelector('.user-channel-profile');
        this.ctxMW = document.querySelector('.message-ctx-menu-mw');
        this.ctx = document.querySelector('.message-ctx-menu');
        this.urlPattern = /(\b(https?:\/\/|www\.)[^\s<]+[\w/])/g;
    }

    setChannelStart() {
        const startChannel = document.createElement('div');
        startChannel.className = 'startChannel';
        msgsList.appendChild(startChannel);

        const h2 = document.createElement('h2');
        h2.textContent = 'Это начало канала';
        startChannel.appendChild(h2);
    }

    setNewMessage(msg, data, owner) {
        const li = document.createElement('li');
        li.className = 'msg';
        msgsList.appendChild(li);
    
        const img = document.createElement('img');
        img.src = './img/users/' + data.uid + '.png';
        img.alt = '';
        li.appendChild(img);
    
        const text = document.createElement('div');
        text.className = 'msg-text';
        li.appendChild(text);
    
        const userInfoBlock = document.createElement('div');
        userInfoBlock.className = 'msg-user-info';
        text.appendChild(userInfoBlock);
    
        const userName = document.createElement('p');
        if(localStorage.getItem('hidenames') === '1') userName.textContent = 'Неизвестно';
        else userName.textContent = data.userName;
        if(owner == data.uid) {
            userName.className = 'user-name-msg owner';
        } else {
            userName.className = 'user-name-msg';
        }
        
        userName.addEventListener('click', async () => {
            const me = await getProfileInfo('0');
            const r = await getProfileInfo(data.uid);
            
            document.querySelector('.user-channel-profile-avatar img').src = './img/users/' + data.uid + '.png';
            document.querySelector('.user-channel-profile-text h3').textContent = data.userName;
            document.querySelector('.user-channel-profile-text p').textContent = r.bio;

            if(r.id == me.id) {
                document.querySelector('.user-channel-profile-bot').innerHTML = '';
                document.querySelector('.user-channel-profile-bot').style.marginTop = 0;
            } else {
                document.querySelector('.user-channel-profile-bot').innerHTML = '';
                document.querySelector('.user-channel-profile-bot').style.marginTop = '40px';
                const sendMsg = document.createElement('div');
                sendMsg.textContent = 'Написать сообщение';
                sendMsg.classList = 'user-channel-btn';
                sendMsg.addEventListener('click', async () => await sendMessageBtn(data.uid));
                document.querySelector('.user-channel-profile-bot').appendChild(sendMsg);

                const isFriendVar = await isFriend(data.uid);
                switch(isFriendVar) {
                    case '1':
                        const deleteFriendE = document.createElement('div');

                        deleteFriendE.onclick = async () => {
                            const r = await deleteFriend(data.uid);
                            location.reload();
                        }
        
                        deleteFriendE.textContent = 'Удалить из друзей';
                        deleteFriendE.classList = 'user-channel-btn';
                        document.querySelector('.user-channel-profile-bot').appendChild(deleteFriendE);
                        break;
                    case '2':
                        const sendFriendsReq = document.createElement('div');

                        sendFriendsReq.onclick = async () => {
                            const r = await sendFriendReqTo(data.uid);
                            location.reload();
                        }
        
                        sendFriendsReq.textContent = 'Добавить в друзья';
                        sendFriendsReq.classList = 'user-channel-btn';
                        document.querySelector('.user-channel-profile-bot').appendChild(sendFriendsReq);
                        break;
                    case '3':
                        const closeReq = document.createElement('div');

                        closeReq.onclick = async () => {
                            const r = await closeOGFriendReq(data.uid);
                            location.reload();
                        }
        
                        closeReq.textContent = 'Отменить заявку';
                        closeReq.classList = 'user-channel-btn';
                        document.querySelector('.user-channel-profile-bot').appendChild(closeReq);
                        break;
                    default:
                        break;
                }
            }

            this.profile.classList.add('active');
            this.dim.classList.add('active');
        });

        document.addEventListener('click', (event) => {
            if (!this.profileContent.contains(event.target)) {
                this.profile.classList.remove('active');
                this.dim.classList.remove('active');
            }
        });

        userInfoBlock.appendChild(userName);
    
        const date = document.createElement('p');
        date.className = 'data-msg';
        date.textContent = data.date;
        userInfoBlock.appendChild(date);
    
        const msgText = document.createElement('pre');

        if(localStorage.getItem('showlinks') === '1') {
            const linkedMsg = msg.replace(this.urlPattern, (url) => {
                let href = url;
                
                if(href.startsWith('www.')) {
                    href = 'http://' + href;
                }
    
                return `<a href="${href}" target="_blank">${url}</a>`
            });
    
            msgText.innerHTML = linkedMsg;
        } else {
            msgText.textContent = msg;
        }

        text.appendChild(msgText);
        scrollDiv.scrollTo(0, scrollDiv.scrollHeight);
    }

    async setChannelStgs(type, id, name, bio, owner = '', key = '') {
        const me = await getProfileInfo('0');
        document.querySelector('.server-settings').innerHTML = '';
        const h2 = document.createElement('h2');
        h2.textContent = name;
        document.querySelector('.server-settings').appendChild(h2);

        const p1 = document.createElement('p');
        p1.textContent = 'Владелец: ' + owner.userName;
        document.querySelector('.server-settings').appendChild(p1);

        const p2 = document.createElement('p');
        p2.textContent = 'Описание: ' + bio;
        document.querySelector('.server-settings').appendChild(p2);

        const p3 = document.createElement('p');
        p3.textContent = 'Код приглашения: ' + key;
        document.querySelector('.server-settings').appendChild(p3);

        const p4 = document.createElement('p');
        p4.textContent = 'Айди канала: ' + id;
        document.querySelector('.server-settings').appendChild(p4);

        const exit = document.createElement('div');
        exit.className = 'exit-channel';

        if(owner.id == me.id) exit.textContent = 'Удалить канал';
        else exit.textContent = 'Покинуть канал';

        document.querySelector('.server-settings').appendChild(exit);
    }

    setChannelStgsPersonal(userName, bio) {
        document.querySelector('.server-settings').innerHTML = '';
        const h2 = document.createElement('h2');
        h2.textContent = userName;
        document.querySelector('.server-settings').appendChild(h2);

        const p1 = document.createElement('p');
        p1.textContent = 'Описание: ' + bio;
        document.querySelector('.server-settings').appendChild(p1);

        const exit = document.createElement('div');
        exit.className = 'exit-channel';
        exit.textContent = 'Удалить';

        document.querySelector('.server-settings').appendChild(exit);
    }

    msgsList;
    dim;
    profile;
    ctxMW;
    ctx;
    urlPattern;
}