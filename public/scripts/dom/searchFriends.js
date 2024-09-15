document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-friends');
    const channelsList = document.getElementById('friends-list1');
    const channelItems = channelsList.getElementsByClassName('friends-item');

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