function sendFriendReqTo(uid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/sendFriendReqTo',
            contentType: 'application/json',
            data: JSON.stringify({ 
                uid: uid
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