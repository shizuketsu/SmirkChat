if(localStorage.getItem('whitetheme') === '1') {
    const theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = './css/whitetheme.css';
    document.querySelector('head').appendChild(theme);
}