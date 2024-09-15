function isFriend(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/isFriend',
            contentType: 'application/json',
            data: JSON.stringify({ 
                id: id 
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