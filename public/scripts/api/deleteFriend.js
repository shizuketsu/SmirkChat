function deleteFriend(uid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/deleteFriend',
            contentType: 'application/json',
            data: JSON.stringify({ 
                id: uid
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