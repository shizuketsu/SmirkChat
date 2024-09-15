function getServerMembers(sid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/getServerMembers',
            contentType: 'application/json',
            data: JSON.stringify({ 
                sid: sid
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