function createChannelFN(fdata) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: '/createChannel',
            data: fdata,
            processData: false,
            contentType: false,
            success: (data) => {
                resolve(data);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                reject(`Ошибка: ${textStatus}, ${errorThrown}`);
            }
        });
    });
}