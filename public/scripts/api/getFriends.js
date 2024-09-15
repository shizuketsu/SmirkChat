function getFriends() {
    return new Promise((resolve, reject) => {
        $.get('/getFriends', (data) => {
            resolve(data);
        }).fail((error) => {
            reject(error);
        });
    });
}