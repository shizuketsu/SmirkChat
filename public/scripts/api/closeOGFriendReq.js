function closeOGFriendReq(uid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/closeOGFriendReq',
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