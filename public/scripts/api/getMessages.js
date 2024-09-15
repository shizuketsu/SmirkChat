function getMessages(keyOrUID) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/getMessages',
            contentType: 'application/json',
            data: JSON.stringify({ 
                keyOrUID: keyOrUID 
            }),
            success: (data) => {
                resolve(data);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                reject(`Ошибка: ${textStatus}, ${errorThrown}`);
            }
        });
    });
}