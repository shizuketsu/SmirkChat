const prevImg = document.querySelector('.acc-prev img');
const prevh3 = document.querySelector('.acc-prev-text h2');
const prevp = document.querySelector('.acc-prev-text p');

const accChangesUserName = document.querySelector('.acc-changes-user-name');
const accChangesEmail = document.querySelector('.acc-changes-email');
const accChangesBio = document.querySelector('.acc-changes-bio');

loadAccount();
async function loadAccount() {
    const acc = await getProfileInfo('0');
    prevh3.textContent = acc.userName;
    accChangesUserName.textContent = acc.userName;
    prevImg.src = './img/users/' + acc.id + '.png';
    prevp.textContent = acc.bio;
    accChangesEmail.textContent = acc.email;
    accChangesBio.textContent = acc.bio;
    subStr(accChangesBio, 40);
}