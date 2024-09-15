function getChannels() {
    return new Promise((resolve, reject) => {
        $.get('/getChannels', (data) => {
            resolve(data);
        }).fail((error) => {
            reject(error);
        });
    });
}