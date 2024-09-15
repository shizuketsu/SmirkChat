function subStr(elem, maxLength = 20) {
    const text = elem.textContent;

    if (text.length > maxLength) {
        elem.textContent = text.substring(0, maxLength) + '...';
    }
}