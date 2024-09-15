class Servers {
    generateRandomKey(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let key = '';
        
        for (let i = 0; i < length; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return key;
    }
    
    generateUniqueKey(existingKeys, length = 8) {
        let key;
        do {
            key = this.generateRandomKey(length);
        } while (existingKeys.includes(key));
        
        return key;
    }
}

module.exports = Servers;