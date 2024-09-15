loadChannelContent();
async function loadChannelContent() {
    await loadChannels();

    const channels = document.querySelectorAll('.channels-item');
    channels.forEach((e) => {
        e.addEventListener('click', () => {

        });
    });
}

function channelsContentHeader() {
    
}

function channelsContentBottom() {

}