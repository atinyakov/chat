const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});

let users = [];
let messages = [];

const fs = require('fs');

app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  
  socket.emit('connected', users, messages )

  socket.join('all')
  socket.on('msg', function (msg) {
    const obj = {
      date: new Date(),
      content: msg,
      username: socket.id
    }
    messages.push(obj)
    socket.emit('message', obj)
    socket.to('all').emit('message', obj)
  });

  socket.on('add user', (user) => {
    users.push(user);
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

      io.emit('uploaded file', users);
    })

  });

  socket.on('get avatar', (__filename) => {
    
    fs.readFile(`./img/avatars/${__filename}`, "utf8", function(err, data){
      if (err) throw err;

      io.emit('set avatar', data);

    });
  });

  
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
