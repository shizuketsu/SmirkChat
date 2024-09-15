const inputs = document.querySelectorAll('.switch input');
const dim1 = document.querySelector('.dim-overlay-wt');

inputs.forEach((element) => {
    if (localStorage.getItem(element.name) === '1') element.checked = true;
});

setTimeout(() => dim1.classList.remove('active'), 500);

inputs.forEach((element) => {
    element.addEventListener('input', () => {
        if (element.checked) {
            if(element.name === 'lsfromnone') {
                blockLS('1');
            }

            localStorage.setItem(element.name, '1');
        } else {
            if(element.name === 'lsfromnone') {
                blockLS('0');
            }

            localStorage.setItem(element.name, '0');
        }
    });
});