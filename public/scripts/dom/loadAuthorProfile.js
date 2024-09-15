const authorProfileImg = document.querySelector('.mini-author-profile-img');
const authorProfileUserName = document.querySelector('.mini-author-profile-text h3');
const authorProfileBio = document.querySelector('.mini-author-profile-text p');

loadAuthorProfile();
async function loadAuthorProfile() {
    const author = await getProfileInfo('0');
    authorProfileUserName.textContent = author.userName;
    authorProfileImg.src = './img/users/' + author.id + '.png';
    authorProfileBio.textContent = author.bio;
    subStr(authorProfileBio);
}