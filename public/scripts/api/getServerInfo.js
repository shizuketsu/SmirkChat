function getServerInfo(key) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/getServerInfo',
            contentType: 'application/json',
            data: JSON.stringify({ 
                key: key
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