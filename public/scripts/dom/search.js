document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const channelsList = document.getElementById('channels-list');
    const channelItems = channelsList.getElementsByClassName('channels-item');

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();

        for (let i = 0; i < channelItems.length; i++) {
            const item = channelItems[i];
            const text = item.textContent || item.innerText;

            if (text.toLowerCase().indexOf(filter) > -1) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        }
    });
});