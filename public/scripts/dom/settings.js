const menuBtn = document.querySelector('.options-icon');
const settingsBlock = document.querySelector('.channels-settings');
const dim = document.querySelector('.dim-overlay');

menuBtn.addEventListener('click', () => {
    settingsBlock.classList.add('active');
    dim.classList.add('active');
});

document.addEventListener('click', (event) => {
    if(!menuBtn.contains(event.target)) {
        settingsBlock.classList.remove('active');
        dim.classList.remove('active');
    }
});