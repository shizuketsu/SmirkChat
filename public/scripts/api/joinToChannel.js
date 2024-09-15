function joinToChannel(str, blockID) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/joinToChannel',
            contentType: 'application/json',
            data: JSON.stringify({ 
                str: str,
                blockID: blockID
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