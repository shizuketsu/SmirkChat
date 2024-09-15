const socket = io();

const input = document.getElementById('msgTextArea');
const msgsList = document.querySelector('.messages-list');
const sendBtn = document.getElementById('sendBtn');
const scrollDiv = document.querySelector('.msgs-content');
const msgLIB = new Messages();

scrollDiv.scrollTo(0, scrollDiv.scrollHeight);
sendBtn.addEventListener('click', sendMessage);

document.addEventListener('keyup', (e) => {
    if (e.code === 'Enter' && localStorage.getItem('entermsg') === '1') {
        if (!e.shiftKey) {
            sendMessage();
        }
    }
});

document.getElementById('files-msg-add-btn', () => {
    
});

socket.on('msg', async (msg, data, keyOrUID) => {
    if(keyOrUID !== localStorage.getItem('keyOrUID')) return;
    
    if(localStorage.getItem('showchannelowner') === '1' && !keyOrUID.includes('|')) {
        const sinfo = await getServerInfo(keyOrUID);
        msgLIB.setNewMessage(msg, data, sinfo.owner);
    } else {
        msgLIB.setNewMessage(msg, data);
    }

    scrollDiv.scrollTo(0, scrollDiv.scrollHeight);
});

function sendMessage() {
    if(input.value.trim().length < 1) {
        input.value = '';
        return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    socket.emit('msg', input.value, localStorage.getItem('keyOrUID'), `${day}.${month}.${year} ${hours}:${minutes}`);
    input.value = '';
}