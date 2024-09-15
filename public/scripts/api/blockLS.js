function blockLS(state) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'post',
            url: '/blockLS',
            contentType: 'application/json',
            data: JSON.stringify({ 
                state: state
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