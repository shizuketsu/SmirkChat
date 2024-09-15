const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
const body = document.body;

if (!body.style.overflow) body.style.overflow = 'auto';

hamburger.addEventListener('click', () => {
    body.style.overflow == 'auto' ? body.style.overflow = 'hidden' : body.style.overflow = 'auto';

    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
});