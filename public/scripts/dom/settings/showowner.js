if(localStorage.getItem('showchannelowner') === '1') {
    const sco = document.createElement('link');
    sco.rel = 'stylesheet';
    sco.href = './css/owner.css';
    document.querySelector('head').appendChild(sco);
}
