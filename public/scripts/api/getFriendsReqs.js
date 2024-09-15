function getFriendsReqs() {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/getFriendsReqs',
            contentType: 'application/json',
            data: JSON.stringify({ 
                str: '1'
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