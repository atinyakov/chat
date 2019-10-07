const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});

let users = [];
let messages = [];
let currentUsers = [];


const fs = require('fs');

app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('connected', users,  messages, currentUsers)

  socket.join('all')
  socket.on('msg', function (msg) {

    let index = users.findIndex(user => user.username === socket.id);

    const obj = {
      date: new Date(),
      content: msg,
      username: users[index].nickname
    }
    messages.push(obj)

    socket.emit('message', obj)
    socket.to('all').emit('message', obj)
  });

  socket.on('add user', (user) => {
    users.push(user);
    currentUsers.push(user);

    io.emit('user joined', user);
  });

  socket.on('upload file', (__filename, file, id) => {

    let userUploadedImagePath = `./img/avatars/${__filename}`;

    fs.writeFile(userUploadedImagePath, file, 'base64', function(err){
        if (err) throw err;
        console.log('File saved.');

        users.forEach(user => {
          if( id == user.username) {
            user.avatar = __filename;
          }
        })
        currentUsers.forEach(user => {
          if( id == user.username) {
            user.avatar = __filename;
          }
        })
        

      io.emit('uploaded file', users);
      io.to('all').emit('uploaded file', users)

    })

  });

  socket.on('get avatar', (__filename) => {
    
    fs.readFile(`./img/avatars/${__filename}`, "utf8", function(err, data){
      if (err) throw err;

      io.emit('set avatar', data);

    });
  });

  socket.on('send update avatars', () => {
    io.emit('update avatars');
  })


  socket.on('update username', update => {
    let index = users.findIndex(user => user.nickname === update.nickname);
    users[index].username = update.username;

    io.emit('userDBUpdate', users);

  })

  socket.on('update userlist', (user) => {
    let index = currentUsers.findIndex(user => user.username === socket.id);

    if (index === -1) {
      currentUsers.push(user);
    }

    io.emit('userUpdate', currentUsers);
  })

  socket.on('disconnect', function () {
    let index = currentUsers.findIndex(user => user.username === socket.id);

    currentUsers.splice(index, 1);
    console.log('exit');

    io.emit('userUpdate', currentUsers);
  });
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
