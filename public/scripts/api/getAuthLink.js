const authLink = document.getElementById('auth-link');

$.ajax({
    method: 'get',
    url: './getAuthLink',
    success: (data) => {
        authLink.onclick = () => location.href = data;
    }
})