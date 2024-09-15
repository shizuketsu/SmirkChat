window.addEventListener('beforeunload', (e) => {
    localStorage.setItem('keyOrUID', '');
});