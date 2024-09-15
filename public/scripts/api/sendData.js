function sendAccountData(str, pass, blockID) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/sendAccountData',
            contentType: 'application/json',
            data: JSON.stringify({ 
                str: str,
                password: pass,
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