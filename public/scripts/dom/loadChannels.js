const channelsList = document.getElementById('channels-list');

async function loadChannels() {
    try {
        const channels = await getChannels();

        if(channels !== 'dn') {
            for(let i = 0; i < channels.length; i++) {
                const channel = channels[i];
                if(channel.type === 1) addChannelItem(channel.serverName, channel.bio, channel.sid, 1, channel.key, channel.owner, channel.readonly);
                else if(channel.type === 2) addChannelItem(channel.userName, channel.bio, channel.uid, 2, channel.key);
            }
        }

        const Chanli = document.createElement('li');
        Chanli.id = 'add-channel';
        Chanli.className = 'channels-item';
        channelsList.appendChild(Chanli);

        const ChanserverAvatar = document.createElement('img');
        ChanserverAvatar.src = './img/icons/add.png';
        ChanserverAvatar.alt = '';
        Chanli.appendChild(ChanserverAvatar);

        const ChanchannelItemText = document.createElement('div');
        ChanchannelItemText.className = 'channel-item-text';
        Chanli.appendChild(ChanchannelItemText);

        const Chanh3 = document.createElement('h3');
        Chanh3.textContent = 'Добавить канал';
        ChanchannelItemText.appendChild(Chanh3);

        const Chanp = document.createElement('p');
        Chanp.textContent = 'Добавьте новый канал';
        ChanchannelItemText.appendChild(Chanp);
    } catch (error) {
        console.error('Ошибка при загрузке каналов:', error);
    }

    const addChannelBtn = document.getElementById('add-channel');
    const addModalWindow = document.querySelector('.add-channel-modal-window');
    const dimR = document.querySelector('.dim-overlayR');
    const closeForm = document.querySelector('.close-add-channel-form');
    const start = document.querySelector('.start-add-channel');
    const sendMsgToUser = document.querySelector('.send-message-to-user');
    const addChannel = document.querySelector('.add-channel-block');
    const createChannel = document.querySelector('.create-channel');
    const linkToChannels1 = document.getElementById('links-add-channel-mv1');
    const linkToChannels2 = document.getElementById('links-add-channel-mv2');
    const exit = document.querySelectorAll('.exit-add-channel-btn');
    const addChannelForm = document.querySelector('.add-channel-form');
    const formsBtns = document.querySelectorAll('.create-new-channel');
    let isCreateChannel = 0;

    const handleLinkToChannels1Click = () => {
        start.style.display = 'none';
        sendMsgToUser.style.display = 'block';
    };

    const handleLinkToChannels2Click = () => {
        start.style.display = 'none';
        addChannel.style.display = 'block';
    };

    const handleLinkToChannels3Click = () => {
        start.style.display = 'none';
        createChannel.style.display = 'block';
    };

    const handleExitClick = () => {
        start.style.display = 'block';
        sendMsgToUser.style.display = 'none';
        addChannel.style.display = 'none';
        createChannel.style.display = 'none';
        document.getElementById('readonly').checked = false;
        isCreateChannel = 0;

        document.querySelectorAll('.add-channel-form input').forEach((e) => e.value = '');
    };

    addChannelForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    formsBtns.forEach((element) => {
        element.addEventListener('click', async (e) => {
            e.preventDefault();

            const formName = element.parentElement.parentElement.querySelector('h2').textContent.trim();
            if(!formName) return alert('Некорректное значение поля');

            if(formName === 'Написать человеку') {
                const inputValue = element.parentElement.parentElement.querySelector('input').value;
                if(inputValue < 1) return alert('Некорректное значение поля');
                await joinToChannel(inputValue, '1');

                addModalWindow.classList.remove('active');
                dimR.classList.remove('active');
                element.parentElement.parentElement.querySelector('input').value = '';
                handleExitClick();
                location.reload();
            } else if(formName === 'Присоединиться к каналу') {
                const inputValue = element.parentElement.parentElement.querySelector('input').value;
                if(inputValue.length != 8) return alert('Некорректное значение поля');
                await joinToChannel(inputValue, '2');

                addModalWindow.classList.remove('active');
                dimR.classList.remove('active');
                element.parentElement.parentElement.querySelector('input').value = '';
                handleExitClick();
                location.reload();
            } else {
                return;
            }
        });
    });

    document.querySelector('.create-new-channel1').addEventListener('click', (e) => { // тяжесть
        e.preventDefault();
        handleLinkToChannels3Click();
    });

    document.querySelector('.create-new-channel2').addEventListener('click', async (e) => {
        e.preventDefault();
        const serverName = document.getElementById('createChannelName');
        const bio = document.getElementById('createChannelBio');
        const img = document.getElementById('change-avatar-input');
        const readonly = document.getElementById('readonly');
    
        if (serverName.value.length < 3) {
            return alert('Минимум 3 символа для названия');
        }
    
        const formData = new FormData();
        formData.append('serverName', serverName.value);
        formData.append('desc', bio.value);
        formData.append('img', img.files[0]);
        formData.append('readonly', readonly.checked ? '1' : '0');
    
        await createChannelFN(formData);
        serverName.value = '';
        bio.value = '';
        img.value = '';
        location.reload();
    });

    addChannelBtn.addEventListener('click', () => {
        linkToChannels1.addEventListener('click', handleLinkToChannels1Click);
        linkToChannels2.addEventListener('click', handleLinkToChannels2Click);
        exit.forEach((e) => e.addEventListener('click',handleExitClick ));

        addModalWindow.classList.add('active');
        dimR.classList.add('active');
    });

    closeForm.addEventListener('click', () => {
        addModalWindow.classList.remove('active');
        dimR.classList.remove('active');
    });

    document.querySelector('.go-to-Main-Page').addEventListener('click', () => {
        document.querySelector('.channel-content').classList.remove('active');
    });
}

function showChatField() {
    if(window.innerWidth <= 900) {
        document.querySelector('.channel-content').classList.add('active');
    }
}

function addChannelItem(serverName, bio, sid, type, key, owner = '', readonly = '0') {
    const m = new Messages();
    const input = document.getElementById('msgTextArea');
    const btn = document.querySelector('.send-msg-btn');

    const li = document.createElement('li');
    li.className = 'channels-item';
    channelsList.appendChild(li);

    li.addEventListener('click', async () => {
        if(localStorage.getItem('whitetheme') === '1') {
            document.getElementById('server-members').src = './img/icons/whitetheme/members.png';
            document.getElementById('server-setting').src = './img/icons/whitetheme/options.png';
            document.getElementById('server-owner-settings').src = './img/icons/whitetheme/ooptions.png';
        }
        
        if(type === 1) {
            m.msgsList.innerHTML = '';
            document.getElementById('server-owner-settings').style.display = 'none';
            let r = '';
            const me = await getProfileInfo('0');
            const ownerInfo = await getProfileInfo(owner);
            await m.setChannelStgs('1', sid, serverName, bio, ownerInfo, key);
            await loadServerMembers(sid);
    
            document.querySelector('.channels-content-header-base-info img').src = './img/channels/' + key + '.png';
            document.querySelector('.channels-content-header-base-info h4').textContent = serverName;
            localStorage.setItem('keyOrUID', key);
            r = await getMessages(key);
    
            const exitChannel = document.querySelector('.exit-channel');
    
            exitChannel.addEventListener('click', async () => {
                console.log(1);
    
                if (localStorage.getItem('keyOrUID')) {
                    await exitChannels(localStorage.getItem('keyOrUID'));
                    location.reload();
                }
            });
    
            if(me.id == ownerInfo.id) {
                document.getElementById('server-owner-settings').style.display = 'block';

                document.getElementById('server-name-settings').value = serverName;
                document.getElementById('server-desc-settings').value = bio;
                document.getElementById('change-server-avatar-input').value = '';
            }

            document.querySelector('.channels-content-header').style.display = 'flex';
            m.setChannelStart();
    
            const lines = r.split('→');
            for(let i = 0; i < lines.length; i++) {
                if(!lines[i]) continue;
    
                const params = lines[i].split('↓');
                m.setNewMessage(params[2], { uid: params[0], userName: params[1], date: params[3] }, ownerInfo.id);
            }
    
            if(me.id != ownerInfo.id && readonly == '1') {
                input.style.opacity = '0';
                input.style.visibility = 'hidden';
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
                // document.getElementById('files-msg-add-btn').style.opacity = '0';
                // document.getElementById('files-msg-add-btn').style.visibility = 'hidden';
            } else {
                input.style.opacity = '1';
                input.style.visibility = 'visible';
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
                // document.getElementById('files-msg-add-btn').style.opacity = '1';
                // document.getElementById('files-msg-add-btn').style.visibility = 'visible';
            }
        } else if(type === 2) {
            localStorage.setItem('keyOrUID', key);
            m.msgsList.innerHTML = '';
            document.getElementById('server-owner-settings').style.display = 'none';
            let r = '';
            const me = await getProfileInfo('0');
            m.setChannelStgsPersonal(serverName, bio);
            await loadPersonalMembers(key, serverName, me.userName);

            document.querySelector('.channels-content-header-base-info img').src = './img/users/' + key.split('|')[0] + '.png';
            document.querySelector('.channels-content-header-base-info h4').textContent = serverName;
            document.querySelector('.channels-content-header').style.display = 'flex';

            m.setChannelStart();
            r = await getMessages(key);

            const lines = r.split('→');
            for(let i = 0; i < lines.length; i++) {
                if(!lines[i]) continue;
    
                const params = lines[i].split('↓');
                m.setNewMessage(params[2], { uid: params[0], userName: params[1], date: params[3] });
            }

            const exitChannel = document.querySelector('.exit-channel');
    
            exitChannel.addEventListener('click', async () => {
                console.log(1);
    
                if (localStorage.getItem('keyOrUID')) {
                    await exitChannels(localStorage.getItem('keyOrUID'));
                    location.reload();
                }
            });

            input.style.opacity = '1';
            input.style.visibility = 'visible';
            btn.style.opacity = '1';
            btn.style.visibility = 'visible';
        }

        showChatField();
    });

    const serverAvatar = document.createElement('img');
    if(type === 1) serverAvatar.src = './img/channels/' + key + '.png';
    else if(type === 2) serverAvatar.src = './img/users/' + sid + '.png';
    serverAvatar.alt = '';
    li.appendChild(serverAvatar);

    const channelItemText = document.createElement('div');
    channelItemText.className = 'channel-item-text';
    li.appendChild(channelItemText);

    const h3 = document.createElement('h3');
    h3.textContent = serverName;
    channelItemText.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = bio;
    subStr(p, 15);
    channelItemText.appendChild(p);
}