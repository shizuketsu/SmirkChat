function sendMessageBtn(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/sendMessageBtn',
            contentType: 'application/json',
            data: JSON.stringify({ 
                id: id,
            }),
            success: (data) => {
                resolve(data);
                location.href = 'channels';
            },
            error: (jqXHR, textStatus, errorThrown) => {
                reject(`Ошибка: ${textStatus}, ${errorThrown}`);
            }
        });
    });
}