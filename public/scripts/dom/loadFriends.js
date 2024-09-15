const friendsList = document.getElementById('friends-list1');
const friendsCount = document.getElementById('friends-counter1');
const friendsList2 = document.getElementById('friends-list2');
const friendsCount2 = document.getElementById('friends-counter2');

class Friends {
    addFriendItem(id, userName) {
        const li = document.createElement('li');
        li.className = 'friends-item';
        friendsList.appendChild(li);

        li.addEventListener('click', async () => {
            const r = await getProfileInfo(id);
            document.querySelector('.user-channel-profile-avatar img').src = './img/users/' + id + '.png';
            document.querySelector('.user-channel-profile-text h3').textContent = userName;
            document.querySelector('.user-channel-profile-text p').textContent = r.bio;

            document.querySelector('.user-channel-profile-bot').innerHTML = '';
            document.querySelector('.user-channel-profile-bot').style.marginTop = '40px';

            const sendMsg = document.createElement('div');
            sendMsg.textContent = 'Написать сообщение';
            sendMsg.classList = 'user-channel-btn';
            sendMsg.addEventListener('click', async () => await sendMessageBtn(id));
            document.querySelector('.user-channel-profile-bot').appendChild(sendMsg);

            const isFriendVar = await isFriend(id);
            switch(isFriendVar) {
                case '1':
                    const deleteFriendE = document.createElement('div');

                    deleteFriendE.onclick = async () => {
                        const r = await deleteFriend(id);
                        location.reload();
                    }
    
                    deleteFriendE.textContent = 'Удалить из друзей';
                    deleteFriendE.classList = 'user-channel-btn';
                    document.querySelector('.user-channel-profile-bot').appendChild(deleteFriendE);
                    break;
                case '2':
                    const sendFriendsReq = document.createElement('div');

                    sendFriendsReq.onclick = async () => {
                        const r = await sendFriendReqTo(id);
                        location.reload();
                    }
    
                    sendFriendsReq.textContent = 'Добавить в друзья';
                    sendFriendsReq.classList = 'user-channel-btn';
                    document.querySelector('.user-channel-profile-bot').appendChild(sendFriendsReq);
                    break;
                case '3':
                    const closeReq = document.createElement('div');

                    closeReq.onclick = async () => {
                        const r = await closeOGFriendReq(id);
                        location.reload();
                    }
    
                    closeReq.textContent = 'Отменить заявку';
                    closeReq.classList = 'user-channel-btn';
                    document.querySelector('.user-channel-profile-bot').appendChild(closeReq);
                    break;
                default:
                    break;
            }

            document.querySelector('.user-channel-profile-mw').classList.add('active');
            document.querySelector('.dim-overlayRR').classList.add('active');
        });

        document.addEventListener('click', (event) => {
            if (!document.querySelector('.user-channel-profile').contains(event.target)) {
                document.querySelector('.user-channel-profile-mw').classList.remove('active');
                document.querySelector('.dim-overlayRR').classList.remove('active');
            }
        });

        const hr = document.createElement('hr');
        li.appendChild(hr);

        const friendInfo = document.createElement('div');
        friendInfo.className = 'friend-info';
        li.appendChild(friendInfo);

        const avatar = document.createElement('img');
        avatar.src = './img/users/' + id + '.png';
        avatar.alt = '';
        friendInfo.appendChild(avatar);

        const p = document.createElement('p');
        p.textContent = userName;
        friendInfo.appendChild(p);
    }

    addFriendReqItem(id, userName) {
        const li = document.createElement('li');
        li.className = 'friends-item';
        friendsList2.appendChild(li);

        const hr = document.createElement('hr');
        li.appendChild(hr);

        const friendInfo = document.createElement('div');
        friendInfo.className = 'friend-info';
        li.appendChild(friendInfo);

        const avatar = document.createElement('img');
        avatar.src = './img/users/' + id + '.png';
        avatar.alt = '';
        friendInfo.appendChild(avatar);

        const p = document.createElement('p');
        p.textContent = userName;
        friendInfo.appendChild(p);

        const btns = document.createElement('div');
        btns.className = 'friend-info-btns';
        li.appendChild(btns);

        const acceptBtn = document.createElement('div');
        acceptBtn.className = 'accept-friend-btn';
        acceptBtn.textContent = 'Принять';

        acceptBtn.addEventListener('click', async () => {
            await acceptFriendReq(id);
            location.reload();
        });

        btns.appendChild(acceptBtn);

        const closeBtn = document.createElement('div');
        closeBtn.className = 'accept-friend-btn';
        closeBtn.textContent = 'Отклонить';

        closeBtn.addEventListener('click', async () => {
            await closeFriendReq(id);
            location.reload();
        });

        btns.appendChild(closeBtn);
    }
}

loadFriends();
async function loadFriends() {
    const friendsDOM = new Friends();
    const friends = await getFriends();
    const friendsReq = await getFriendsReqs();

    if(Array.isArray(friends) && friends.length) {
        friendsCount.textContent = 'Всего друзей: ' + friends.length;
        for (const friend of friends) friendsDOM.addFriendItem(friend.uid, friend.userName);
    } else {
        friendsCount.textContent = 'Всего друзей: 0';
    }

    if(Array.isArray(friendsReq) && friendsReq.length) {
        friendsList2.style.marginBottom = '40px';
        friendsCount2.textContent = 'Входящие запросы: ' + friendsReq.length;
        for (const friendReq of friendsReq) friendsDOM.addFriendReqItem(friendReq.uid, friendReq.userName);
    } else {
        friendsCount2.style.display = 'none';
    }
}