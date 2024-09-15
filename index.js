const express = require('express');
const path = require('path');
const fs = require('fs');
const sql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { Sequelize } = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const formidable = require('formidable');
const requestIp = require('request-ip');
const params = require('./config.json');
const http = require('http');
const socketIo = require('socket.io');
const Servers = require('./libs/servers');

const port = 3000;
const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);
const usersAvatarsDir = path.join(__dirname, 'public', 'img', 'users');
const servers = new Servers();

const dbOptions = {
    host: params.database.host,
    user: params.database.user,
    database: params.database.db,
    password: params.database.password,
}

const db = sql.createConnection(dbOptions);
const sequelize = new Sequelize(dbOptions.database, dbOptions.user, dbOptions.password, {
    host: dbOptions.host,
    dialect: 'mysql',
    logging: false
});
const sessionStore = new SequelizeStore({ db: sequelize })

sequelize.authenticate().then(() => {
    console.log('sessionStore was connected');
}).catch((e) => {
    console.log('sessionStore | ' + e);
});

app.use(requestIp.mw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionMiddleware = session({
    name: 'KLMSF',
    store: sessionStore,
    secret: 'amogus',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000 * 24 * 30 * 12
    }
});

app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, (err) => {
        if (err) return next(err);
        next();
    });
});

sessionStore.sync();

db.connect((err) => {
    if(err) return console.log('Err in db');
    console.log('connected to mysql db');
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, async (err, r) => {
            if(err) return reject(err);
            resolve(r);
        });
    });
}

app.get('/getProfileInfo', (req, res) => res.sendStatus(403));
app.get('/sendAccountData', (req, res) => res.sendStatus(403));

app.get('/register', (req, res) => {
    const uid = req.session.uid;
    if(!uid) return res.sendFile(path.join(__dirname, 'public', 'reg.html'));
    else res.redirect('./channels');
});

app.get('/auth', (req, res) => {
    const uid = req.session.uid;
    if(!uid) return res.sendFile(path.join(__dirname, 'public', 'auth.html'));
    else res.redirect('./channels');
});

app.get('/getAuthLink', (req, res) => {
    const uid = req.session.uid;

    if(!uid) res.send('./auth');
    else res.send('./channels');
});

app.get('/channels', (req, res) => {
    const uid = req.session.uid;
    if(!uid) return res.redirect('./auth');
    res.sendFile(path.join(__dirname, 'public', 'channels.html'));
});

app.get('/account', (req, res) => {
    const uid = req.session.uid;
    if(!uid) return res.redirect('./auth');
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.get('/friends', (req, res) => {
    const uid = req.session.uid;
    if(!uid) return res.redirect('./auth');
    res.sendFile(path.join(__dirname, 'public', 'friends.html'));
});

app.get('/settings', (req, res) => {
    const uid = req.session.uid;
    if(!uid) return res.redirect('./auth');
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/exit', (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.status(500).send('Ошибка при удалении сессии');
        res.redirect('./auth.html');
    });
});

app.get('/getChannels', (req, res) => { 
    const uid = req.session.uid; 
    const password = req.session.password; 
    
    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send(-1); 
        if(!user.servers) return res.send('dn');
        let servers = user.servers.split(';');
        servers = servers.slice(0, -1);
        let result = new Array();
        
        const promises = servers.map((item) => {
            return new Promise((resolve, reject) => {
                if(!item.includes('|')) {
                    db.query('SELECT * FROM servers WHERE serverKey = ?', [item.trim().replace('\n', '')], (err, r) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
    
                        if(r.length != 1) {
                            console.log('Аномалия');
                            return reject('Аномалия');
                        }
            
                        const server = r[0];
                        resolve({ serverName: server.serverName, bio: server.serverBio, sid: server.sid, type: 1, key: server.serverKey, owner: server.owner, readonly: server.readonly });
                    });
                } else {
                    db.query('SELECT * FROM users WHERE id = ?', [item.split('|')[0]], (err, r) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
    
                        if(r.length != 1) {
                            console.log('Аномалия');
                            return reject('Аномалия');
                        }
            
                        const user = r[0];
                        resolve({ userName: user.userName, bio: user.bio, uid: user.id, type: 2, key: item });
                    });
                }
            });
        });

        try {
            const results = await Promise.all(promises);
            result.push(...results);
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });
});

app.get('/getFriends', async (req, res) => {
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send(-1); 

        if(!user.friends) return res.send('-3');
        let friends = user.friends.split(';');
        friends = friends.slice(0, -1);
        let result = new Array();
        
        const promises = friends.map((item) => {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM users WHERE id = ?', [item.trim().replace('\n', '')], (err, r) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }

                    if(r.length != 1) {
                        console.log('Пипец странная аномалия');
                        return reject('Пипец странная аномалия');
                    }
        
                    const friend = r[0];
                    resolve({ userName: friend.userName, uid: friend.id });
                });
            });
        });

        try {
            const results = await Promise.all(promises);
            result.push(...results);
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });
});

app.post('/register', async (req, res) => {
    const { email, pass, userName } = req.body;

    if (!email || !pass || !userName) return res.status(400).send('CANNOT GET');
    if(userName.length < 3) return res.send('Имя пользователя должно иметь хотя бы 3 символа');

    db.query('SELECT * FROM users WHERE ip = ?', [req.clientIp], async (err, r) => {
        if (err) throw err;
        if(r.length > 5) return res.status(401).send('Вы создали слишком много аккаунтов');

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, r) => {
            if (err) throw err;
            if(r.length > 0) return res.status(401).send('Аккаунт с этой почтой уже существует');
    
            db.query('SELECT * FROM users WHERE userName = ?', [userName], async (err, r) => {
                if (err) throw err;
                if(r.length > 0) return res.status(401).send('Аккаунт с таким именем пользователя уже существует');
    
                const hash = await bcrypt.hash(pass, 10);
    
                db.query('INSERT INTO users (userName, email, password, bio, servers, ip, friends, friendsReq, friendsReqOutgoing) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [userName, email, hash, 'Привет! Я новичок.', '', req.clientIp, '', '', ''], (err, results) => {
                    if (err) throw err;
    
                    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, r) => {
                        req.session.uid = r[0].id;
                        req.session.password = pass;
    
                        fs.copyFile(path.join(usersAvatarsDir, 'default.png'), path.join(usersAvatarsDir, r[0].id + '.png'), (err) => {
                            if(err) return res.send(-1);
                            return res.status(200).redirect('./channels');
                        });
                    });
                });
            });
        });
    });
});

app.post('/auth', async (req, res) => {
    const { email, pass } = req.body;

    if (!email || !pass) return res.status(400).send('CANNOT GET');

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, r) => {
        if (err) throw err;
        if(r.length < 1) return res.status(400).send('Пользователя не существует');

        const user = r[0];
        const isMatch = await bcrypt.compare(pass, user.password);

        if(isMatch) {
            req.session.uid = r[0].id;
            req.session.password = pass;
            return res.status(200).redirect('./channels');
        } else {
            return res.status(401).send('Неверный пароль');
        }
    });
});

app.post('/getProfileInfo', async (req, res) => {
    let { id } = req.body;

    if(id === '0') id = req.session.uid;

    db.query('SELECT * FROM users WHERE id = ?', [id], async (err, r) => {
        if(r.length < 1) return res.status(401).send('Пользователь не найден');
        
        res.send({ 
            id: r[0].id, 
            userName: r[0].userName, 
            bio: r[0].bio, 
            email: r[0].email 
        });
    });
});

app.post('/sendAccountData', async (req, res) => {
    const uid = req.session.uid;
    const { str, password, blockID } = req.body;

    switch(blockID) {
        case 1:
            db.query('SELECT * FROM users WHERE userName = ?', [str], (err, r) => {
                if(err) return res.send('Проблема на стороне сервера');
                if(r.length > 0) return res.send('Аккаунт с таким именем уже существует');

                db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => {
                    if(err) return res.send('Проблема на стороне сервера');

                    const user = r[0];
                    const isMatch = await bcrypt.compare(password, user.password);
                    if(!isMatch) return res.send('Неверный пароль');

                    db.query('UPDATE users SET userName = ? WHERE id = ?', [str, uid], (err, r) => {
                        if(err) return res.send('Проблема на стороне сервера');

                        db.query('UPDATE messages SET userName = ? WHERE userName = ?', [str, user.userName], async (err, r) => {
                            if(err) return res.send('Проблема на стороне сервера');
                            
                            res.status(200).send('1');
                        });
                    });
                });
            });

            break;
        case 2:
            if(str.length > 100) return res.send('Био не должно превышать 100 символов');
            db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => {
                const user = r[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if(!isMatch) return res.send('Неверный пароль');

                db.query('UPDATE users SET bio = ? WHERE id = ?', [str, uid], (err, r) => {
                    if(err) return res.send('Проблема на стороне сервера');
                    res.status(200).send('1');
                });
            });

            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            if(str.length < 6) return res.send('Пароль должен содержать хотя бы 6 символов');
            db.query('SELECT * FROM `users` WHERE id = ?', [uid], async (err, r) => {
                if(err) return res.status(500).send('Проблема на стороне сервера');

                const user = r[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if(!isMatch) return res.status(400).send('Неверный пароль');

                const hash = await bcrypt.hash(str, 10);

                db.query('UPDATE users SET password = ? WHERE id = ?', [hash, uid], (err, r) => {
                    if(err) return res.status(500).send('Проблема на стороне сервера');
                    res.status(200).send('1');
                });
            });

            break;
        default:
            res.send('-112');
            break;
    }
});

app.post('/joinToChannel', async (req, res) => { 
    const { str, blockID } = req.body; 
    const uid = req.session.uid;
    const password = req.session.password;

    switch(blockID) { 
        case '1':
            if(str.length < 1) return res.send('Такого пользователя не существует');

            db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => {
                if(err) return console.log(err);

                const user = r[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if(!isMatch) return res.status(400).send('Неверный пароль');

                db.query('SELECT * FROM users WHERE userName = ?', [str], async (err, r) => {
                    if(err) console.log(err);

                    if(r[0].blockls === '1' && !r[0].friends.split(';').includes(String(uid))) return res.send('ls close');

                    const sUser = r[0];
                    let servers = '';

                    if(!user.servers) {
                        servers = '';
                    } else {
                        servers = user.servers;
                        if(servers.split(';').includes(sUser.id + '|' + uid)) return res.send('У вас уже есть чат с этим пользователем');
                    }

                    servers += sUser.id + '|' + uid + ';';
                    let sServers;
                    
                    if(!sUser.servers) {
                        sServers += uid + '|' + sUser.id + ';'
                    } else {
                        sServers = sUser.servers;
                        if(!sServers.split(';').includes(uid + '|' + sUser.id)) sServers += uid + '|' + sUser.id + ';'
                    }

                    db.query('UPDATE users SET servers = ? WHERE id = ?', [servers, uid], (err, r) => {
                        if (err) return console.log(err);
                    
                        db.query('UPDATE users SET servers = ? WHERE userName = ?', [sServers, str], (err) => {
                            if (err) return console.log(err);

                            res.send('Чаты созданы');
                        });
                    });
                });
            });

            break;
        case '2': 
            if(str.length != 8) return res.send('Недействительный ключ'); 
            
            db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
                if(err) return console.log(err);
                const user = r[0]; 
                const isMatch = await bcrypt.compare(password, user.password); 
                if(!isMatch) return res.status(400).send('Неверный пароль'); 
                let servers = user.servers;
                
                db.query('SELECT * FROM servers WHERE serverKey = ?', [str], async (err, r) => { 
                    if(err) return console.log(err);
                    if(r.length < 1) return res.send('Сервер не найден'); 

                    if(!servers.includes(str + ';')) servers = servers + str + ';'; 
                    else return res.send('Вы уже находитесь в этом канале'); 
                    const server = r[0]; 
                    const members = server.members + uid + ';'; 
                    
                    db.query('UPDATE users SET servers = ? WHERE id = ?', [servers, uid], (err) => {
                        if (err) return console.log(err);
                    
                        db.query('UPDATE servers SET members = ? WHERE serverKey = ?', [members, str], (err) => {
                            if (err) return console.log(err);

                            res.send('Добро пожаловать');
                        });
                    });
                }); 
            }); 
            
            break; 
        default: 
        break; 
    } 
});

app.post('/changeAvatar', async (req, res) => {
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => {
        if(err) return res.send(err);

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send(-1);

        const form = new formidable.IncomingForm();
        form.maxFileSize = 10 * 1024 * 1024;
        form.uploadDir = path.join(__dirname, 'public', 'img', 'users');
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).send('Ошибка при загрузке файла: ' + err.message);
            }
    
            const file = files.newAvatar;

            if (!file) {
                return res.status(400).send('Файл не загружен');
            } else if(file[0].size > form.maxFileSize) {
                return res.status(400).send('Файл не должен быть больше 10мб');
            } else if(file[0].mimetype !== 'image/png') {
                return res.status(400).send('Только PNG файлы разрешены');
            }
    
            const newFilePath = path.join(form.uploadDir, uid + '.png');
            fs.rename(path.normalize(file[0].filepath), newFilePath, (err) => {
                if (err) {
                    return res.status(500).send('Ошибка при сохранении файла');
                }

                res.redirect('/account');
            });
        });
    });
});

app.post('/getMessages', async (req, res) => {
    const { keyOrUID } = req.body;

    db.query('SELECT * FROM messages WHERE keyOrUID = ?', [keyOrUID], async (err, r) => {
        if(err) return res.send(err);

        let result = '';
        for(let i = 0; i < r.length; i++) result += r[i].uid + '↓' + r[i].userName + '↓' + r[i].text + '↓' + r[i].date + '→';

        res.status(200).send(result);
    });
});

app.post('/exitChannel', async (req, res) => { // TODO: доделать
    const { keyOrUID } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    if(!keyOrUID) return res.send('chill bro');
    
    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => {
        if(err) return console.log(err + ' 1');

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        if(!keyOrUID.includes('|')) {
            db.query('SELECT * FROM servers WHERE serverKey = ?', [keyOrUID], async (err, r2) => {
                if(r2[0].owner == uid) {
                    db.query('DELETE FROM servers WHERE serverKey = ?', [keyOrUID], async (err, r) => {
                        db.query('SELECT * FROM users WHERE servers LIKE ?', [`%${keyOrUID}%`], async (err, r) => {
                            for(let i = 0; i < r.length; i++) {
                                const user = r[i];
                                const newServers = user.servers.split(';').filter((skey) => skey != keyOrUID).join(';');

                                await query('UPDATE users SET servers = ? WHERE id = ?', [newServers, user.id]);
                            }

                            db.query('DELETE FROM messages WHERE keyOrUID = ?', [keyOrUID], async (err, r) => {
                                return res.send('1');
                            });
                        });
                    });
                } else {
                    let userServers = r[0].servers.split(';');
                    let newUserServers = '';
                    
                    for(let i = 0; i < userServers.length; i++) {
                        if(!userServers[i]) continue;
                        if(keyOrUID == userServers[i]) continue;
                        newUserServers += userServers[i] + ';';
                    }
            
                    db.query('SELECT * FROM servers WHERE serverKey = ?', [keyOrUID], (err, r2) => {
                        if(err) return console.log(err + ' 2');
            
                        let serverMembers = r2[0].members.split(';');
                        let newServerMembers = '';
            
                        for(let i = 0; i < serverMembers.length; i++) {
                            if(!serverMembers[i]) continue;
                            if(uid == serverMembers[i]) continue;
                            newServerMembers += serverMembers[i] + ';';
                        }
            
                        db.query('UPDATE users SET servers = ? WHERE id = ?', [newUserServers, uid], (err, r) => {
                            if(err) return console.log(err + ' 3');
            
                            db.query('UPDATE servers SET members = ? WHERE serverKey = ?', [newServerMembers, keyOrUID], (err, r) => {
                                if(err) return console.log(err + ' 4');
                                
                                res.status(200).send('1');
                            });
                        });
                    });
                }
            });
        } else {
            const newServers = r[0].servers.split(';').filter((skey) => skey != keyOrUID).join(';');

            const invertKey = keyOrUID.split('|')[1] + '|' + keyOrUID.split('|')[0];
            const user2 = keyOrUID.split('|')[0];

            db.query('SELECT * FROM users WHERE id = ?', [user2], async (err, r) => {
                const newServers2 = r[0].servers.split(';').filter((skey) => skey != invertKey).join(';');

                db.query('UPDATE users SET servers = ? WHERE id = ?', [newServers, uid], async (err, r) => {
                    db.query('UPDATE users SET servers = ? WHERE id = ?', [newServers2, user2], async (err, r) => {
                        res.send('1');
                    });
                });
            });
        }
    });
});

app.post('/createChannel', async (req, res) => {
    const uid = req.session.uid;

    db.query('SELECT * FROM servers', [], (err, r) => {
        if (err) return res.status(500).send('Ошибка запроса к базе данных');

        const keys = r.map(server => server.serverKey);
        const serverKey = servers.generateUniqueKey(keys);

        const form = new formidable.IncomingForm();
        form.maxFileSize = 10 * 1024 * 1024;
        form.uploadDir = path.join(__dirname, 'public', 'img', 'channels');
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).send('Ошибка при загрузке файла: ' + err.message);
            }

            if (!fields.serverName) return res.send('-1');

            const file = files.img;
            if(file) { 
                const newFilePath = path.join(form.uploadDir, serverKey + '.png'); 
                fs.renameSync(path.normalize(file[0].filepath), newFilePath); 
            } else { 
                fs.copyFileSync(path.join(__dirname, 'public', 'img', 'channels', 'default.png'), path.join(__dirname, 'public', 'img', 'channels', serverKey + '.png')); 
            }

            db.query('INSERT INTO servers (serverName, serverBio, members, owner, serverKey, readonly) VALUES (?, ?, ?, ?, ?, ?)', [fields.serverName, fields.desc, uid + ';', uid, serverKey, fields.readonly], (err) => {
                if (err) return res.status(500).send('Ошибка добавления канала: ' + err.message);

                db.query('SELECT * FROM users WHERE id = ?', [uid], (err, r) => {
                    if (err) return res.status(500).send('Ошибка запроса пользователя: ' + err.message);
                    
                    const servers = r[0].servers + serverKey + ';';

                    db.query('UPDATE users SET servers = ? WHERE id = ?', [servers, uid], (err) => {
                        if (err) return res.status(500).send('Ошибка обновления пользователя: ' + err.message);
                        res.send('1');
                    });
                });
            });
        });
    });
});

app.post('/sendFriendReqTo', async (req, res) => {
    const { uid } = req.body;
    const meUid = req.session.uid;

    if (uid === meUid) return res.send('-2');

    db.query('SELECT * FROM users WHERE id = ?', [meUid], async (err, r) => {
        if (err) return res.status(500).send('Ошибка сервера');

        if (r.length === 0) {
            return res.status(404).send('Пользователь не найден');
        }

        const friends = r[0].friends ? r[0].friends.split(';') : [];
        const friendsReq = r[0].friendsReq ? r[0].friendsReq.split(';') : [];
        const friendsReqOutgoing = r[0].friendsReqOutgoing ? r[0].friendsReqOutgoing.split(';') : [];

        if (friends.includes(uid) || friendsReq.includes(uid) || friendsReqOutgoing.includes(uid)) {
            return res.send('-1');
        }

        db.query('SELECT * FROM users WHERE id = ?', [uid], (err, r2) => {
            if (err) return res.status(500).send('Ошибка сервера');
            
            if (r2.length === 0) {
                return res.status(404).send('Пользователь не найден');
            }

            const newFriendsReqOutgoing = friendsReqOutgoing.join(';') + uid + ';';
            const newFriendsReq = r2[0].friendsReq + meUid + ';';

            db.query('UPDATE users SET friendsReqOutgoing = ? WHERE id = ?', [newFriendsReqOutgoing, meUid], (err) => {
                if (err) return res.status(500).send('Ошибка при обновлении данных');

                db.query('UPDATE users SET friendsReq = ? WHERE id = ?', [newFriendsReq, uid], (err) => {
                    if (err) return res.status(500).send('Ошибка при обновлении данных');

                    res.send('1');
                });
            });
        });
    });
});

app.post('/getFriendsReqs', async (req, res) => {
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send(-1); 

        if(!user.friendsReq) return res.send('-3');
        let friends = user.friendsReq.split(';');
        friends = friends.slice(0, -1);
        let result = new Array();
        
        const promises = friends.map((item) => {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM users WHERE id = ?', [item.trim().replace('\n', '')], (err, r) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }

                    if(r.length != 1) {
                        console.log('Пипец странная аномалия');
                        return reject('Пипец странная аномалия');
                    }
        
                    const friend = r[0];
                    resolve({ userName: friend.userName, uid: friend.id });
                });
            });
        });

        try {
            const results = await Promise.all(promises);
            result.push(...results);
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });
});

app.post('/acceptFriendReq', async (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        if(user.friends.split(';').includes(String(id))) return res.send('-2');
        else if(!user.friendsReq.split(';').includes(String(id))) return res.send('-3');

        const newFriends = user.friends + id + ';';
        const newFriendsReq = user.friendsReq.split(';').filter((aid) => aid != id).join(';');

        db.query('UPDATE users SET friendsReq = ?, friends = ? WHERE id = ?', [newFriendsReq, newFriends, uid], async (err, r) => {
            db.query('SELECT * FROM users WHERE id = ?', [id], async (err, r2) => {
                const user2 = r2[0];

                const newFriends2 = user2.friends + uid + ';';
                const newFriendsReqOutGoing2 = user2.friendsReqOutgoing.split(';').filter((aid) => aid != uid).join(';');

                db.query('UPDATE users SET friendsReqOutgoing = ?, friends = ? WHERE id = ?', [newFriendsReqOutGoing2, newFriends2, id], async (err, r) => {
                    return res.send('1');
                });
            });
        });
    });
});

app.post('/isFriend', async (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        if(user.friends.split(';').includes(String(id))) {
            return res.send('1'); // есть в друзьях
        } else if (user.friendsReqOutgoing.split(';').includes(String(id))) {
            return res.send('3'); // отправлен запрос
        } else {
            return res.send('2'); // нет в друзьях
        }
    });
});

app.post('/getServerMembers', async (req, res) => {
    const { sid } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        db.query('SELECT * FROM servers WHERE sid = ?', [sid], async (err, r) => {
            if(err) {
                console.log(err);
                return res.status(500).send('Ошибка сервера');
            }

            return res.send(r[0].members + '|' + r[0].owner);
        });
    });
});

app.post('/sendMessageBtn', async (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        if (r.length === 0) return res.status(404).send('Пользователь не найден');

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        db.query('SELECT * FROM users WHERE id = ?', [id], async (err, r) => {
            if(err) {
                console.log(err);
                return res.status(500).send('Ошибка сервера');
            }

            if (r.length === 0) return res.status(404).send('Пользователь не найден');

            if(r[0].blockls === '1' && !r[0].friends.split(';').includes(String(uid))) return res.send('ls close');

            const servers2 = r[0].servers.split(';');
            let newServersForUser2 = r[0].servers; 
            if (!servers2.includes(uid + '|' + id)) newServersForUser2 = newServersForUser2 + uid + '|' + id + ';';

            const servers = user.servers.split(';');

            let newServers = user.servers;
            if(!servers.includes(id + '|' + uid)) newServers = user.servers + id + '|' + uid + ';';
    
            db.query('UPDATE users SET servers = ? WHERE id = ?', [newServers, uid], async (err, r) => {
                if(err) {
                    console.log(err);
                    return res.status(500).send('Ошибка сервера');
                }

                db.query('UPDATE users SET servers = ? WHERE id = ?', [newServersForUser2, id], async (err, r) => {
                    if(err) {
                        console.log(err);
                        return res.status(500).send('Ошибка сервера');
                    }
                    
                    return res.send('1');
                });
            });
        });
    });
});

app.post('/getServerInfo', async (req, res) => {
    const { key } = req.body;

    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        if (r.length === 0) return res.status(404).send('Пользователь не найден');

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        db.query('SELECT * FROM servers WHERE serverKey = ?', [key], async (err, r) => {
            return res.send(r[0]);
        });
    });
});

app.post('/blockLS', async (req, res) => {
    const { state } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        if (r.length === 0) return res.status(404).send('Пользователь не найден');

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        db.query('UPDATE users SET blockls = ? WHERE id = ?', [state, uid], async (err, r) => {
            if(err) console.log(err);

            return res.send('1');
        });
    });
});

app.post('/closeFriendReq', async (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        if(user.friends.split(';').includes(String(id))) return res.send('-2');
        else if(!user.friendsReq.split(';').includes(String(id))) return res.send('-3');

        const newFriendsReq = user.friendsReq.split(';').filter((aid) => aid != id).join(';');

        db.query('UPDATE users SET friendsReq = ? WHERE id = ?', [newFriendsReq, uid], async (err, r) => {
            db.query('SELECT * FROM users WHERE id = ?', [id], async (err, r2) => {
                const user2 = r2[0];
                const newFriendsReqOutGoing2 = user2.friendsReqOutgoing.split(';').filter((aid) => aid != uid).join(';');

                db.query('UPDATE users SET friendsReqOutgoing = ? WHERE id = ?', [newFriendsReqOutGoing2, id], async (err, r) => {
                    return res.send('1');
                });
            });
        });
    });
});

app.post('/sendServerChanges', async (req, res) => {
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        const form = new formidable.IncomingForm();
        form.maxFileSize = 10 * 1024 * 1024;
        form.uploadDir = path.join(__dirname, 'public', 'img', 'channels');
        form.keepExtensions = true;
    
        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).send('Ошибка при загрузке файла: ' + err.message);
            }
    
            if (!fields.name || !fields.desc || !fields.key) return res.send('-3');

            db.query('SELECT * FROM servers WHERE owner = ?', [uid], (err, r) => {
                if(r.length < 1) return res.send('-2');

                db.query('UPDATE servers SET serverName = ?, serverBio = ? WHERE serverKey = ?', [fields.name, fields.desc, fields.key], (err, r) => {
                    const file = files.img;
                    
                    if(file) { 
                        const newFilePath = path.join(form.uploadDir, fields.key + '.png');
                        fs.renameSync(path.normalize(file[0].filepath), newFilePath);
                    }
                    
                    return res.send('1');
                });
            });
        });
    });
});

app.post('/closeOGFriendReq', async (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        if(user.friends.split(';').includes(String(id))) return res.send('-2');
        else if(!user.friendsReqOutgoing.split(';').includes(String(id))) return res.send('-3');

        const newFriendsReqOG = user.friendsReqOutgoing.split(';').filter((aid) => aid != id).join(';');

        db.query('UPDATE users SET friendsReqOutgoing = ? WHERE id = ?', [newFriendsReqOG, uid], async (err, r) => {
            db.query('SELECT * FROM users WHERE id = ?', [id], async (err, r2) => {
                const user2 = r2[0];
                const newFriendsReq = user2.friendsReq.split(';').filter((aid) => aid != uid).join(';');

                db.query('UPDATE users SET friendsReq = ? WHERE id = ?', [newFriendsReq, id], async (err, r) => {
                    return res.send('1');
                });
            });
        });
    });
});

app.post('/deleteFriend', async (req, res) => {
    const { id } = req.body;
    const uid = req.session.uid;
    const password = req.session.password;

    db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => { 
        if(err) {
            console.log(err);
            return res.status(500).send('Ошибка сервера');
        }

        const user = r[0]; 
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch) return res.send('-1');

        if(!user.friends.split(';').includes(String(id))) return res.send('-2');

        const newFriends = user.friends.split(';').filter((aid) => aid != id).join(';');

        db.query('UPDATE users SET friends = ? WHERE id = ?', [newFriends, uid], async (err, r) => {
            db.query('SELECT * FROM users WHERE id = ?', [id], async (err, r2) => {
                const user2 = r2[0];
                const newFriends2 = user2.friends.split(';').filter((aid) => aid != uid).join(';');
    
                db.query('UPDATE users SET friendsReq = ? WHERE id = ?', [newFriends2, id], async (err, r) => {
                    return res.send('1');
                });
            });
        });
    });
});

io.on('connection', (s) => {
    console.log('user connected');
    const uid = s.request.session.uid ? s.request.session.uid : null;

    s.on('msg', (msg, keyOrUID, date) => {
        db.query('SELECT * FROM users WHERE id = ?', [uid], async (err, r) => {
            if(r.length < 1) return res.status(401).send('Пользователь не найден');

            if(!keyOrUID.includes('|')) {
                db.query('SELECT * FROM servers WHERE serverKey = ?', [keyOrUID], async (err, server) => {
                    if(server.readonly == '1' && uid != server.owner) return '-1';

                    db.query('INSERT INTO messages (keyOrUID, username, text, uid, date) VALUES (?, ?, ?, ?, ?)', [keyOrUID, r[0].userName, msg, uid, date], (err, r2) => {
                        if(err) console.log(err);
        
                        const now = new Date();
                        const day = String(now.getDate()).padStart(2, '0');
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const year = now.getFullYear();
                        const hours = String(now.getHours()).padStart(2, '0');
                        const minutes = String(now.getMinutes()).padStart(2, '0');
        
                        io.emit('msg', msg, { uid: uid, userName: r[0].userName, bio: r[0].bio, email: r[0].email, date: `${day}.${month}.${year} ${hours}:${minutes}` }, keyOrUID);
                    });
                });
            } else {
                db.query('INSERT INTO messages (keyOrUID, username, text, uid, date) VALUES (?, ?, ?, ?, ?)', [keyOrUID, r[0].userName, msg, uid, date], (err, r2) => {
                    if(err) console.log(err);
    
                    const now = new Date();
                    const day = String(now.getDate()).padStart(2, '0');
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const year = now.getFullYear();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
    
                    io.emit('msg', msg, { uid: uid, userName: r[0].userName, bio: r[0].bio, email: r[0].email, date: `${day}.${month}.${year} ${hours}:${minutes}` }, keyOrUID);
                });
            }
        });
    });

    s.on('disconnect', (s) => {
        console.log('user disconnected');
    });
});

httpServer.listen(port, '0.0.0.0', () => { // '0.0.0.0'
    console.log('Server was started at port ' + port);
});