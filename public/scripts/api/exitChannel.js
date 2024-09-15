function exitChannels(keyOrUID) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/exitChannel',
            contentType: 'application/json',
            data: JSON.stringify({ 
                keyOrUID: keyOrUID
            }),
            success: (data) => {
                console.log(data);
                resolve(data);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                reject(`Ошибка: ${textStatus}, ${errorThrown}`);
            }
        });
    });
}