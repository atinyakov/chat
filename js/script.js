document.addEventListener('DOMContentLoaded', function() {
  let name = document.querySelector('#name'),
    nickname = document.querySelector('#nickname'),
    authBtn = document.querySelector('#authBtn'),
    sendBtn = document.querySelector('#sendBtn'),
    messageText = document.querySelector('#messageText'),
    messages = document.querySelector('#messages');
    messageContainer = document.querySelector('.message__container'),
    usersList = document.querySelector('#usersList'),
    authPopup = document.querySelector('#authPopup'),
    loadPhoto = document.querySelector('#loadPhoto'),
    fileLoadPopup = document.querySelector('#fileLoadPopup'),
    cancel = document.querySelector('#cancel'),
    sendPhoto = document.querySelector('#sendPhoto'),
    container = document.querySelector('.container'),
    nameOfuser = document.querySelector('.users__block_name'),
    members = document.querySelector('.users__block_members'),
    usersList = document.querySelector('#usersList'),
    messagesPhoto = document.querySelector('#messagesPhoto'),
    templateOfMessage = document.querySelector('#messageList').textContent,
    templateOfUsers = document.querySelector('#listOfUsers').textContent,
    renderUsers = Handlebars.compile(templateOfUsers),
    renderMessages = Handlebars.compile(templateOfMessage),

    users = [],
    messagesListOnPage = [],

    socket = io.connect('http://localhost:3000/');

  socket.on('connected', function (msg) {
      console.log(msg);
      //socket.emit('receiveHistory');
  });

  socket.on('message', addMessage);

  sendBtn.addEventListener('click', (event) => {
    event.preventDefault();

    let messageData = messageText.value.trim();
    let messageInfo = {
      // name: name.value.trim() + ':',
      message: messageData
    };

    
    if(messageData.length == 0){
      
      messageText.classList.add('message__form_input-error');
    }
    socket.emit('msg', messageData);
    messageText.value = '';
      
  });

  function addMessage(message){
    
    messagesListOnPage.push(message);
    let messagesList = renderMessages(messagesListOnPage);
          messages.innerHTML = messagesList;
          messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  authBtn.addEventListener('click', (e) => {
    // var socket = io();
      e.preventDefault(); // prevents page reloading

      let user = {name: name.value, username: nickname.value}
      // console.log(user)
      socket.emit('add user', user);
      console.log('user', user)

      authPopup.style.display = 'none';
      name.value = '';
      nickname.value = '';
      messageText.removeAttribute('disabled');
      sendBtn.removeAttribute('disabled');
  })

  socket.on('user joined', (user) => {
      // let user = document.createElement('li');
      // user.textContent = `${user.value}`
      // usersList.appendChild(user);
      // users.forEach(user => {'
      users.push(user);

        // console.log(user)
        let {name, username} = user;
        renderUsers(users)

        // let listItem = document.createElement('li');
        // listItem.textContent = `${name} ${username}`
        // usersList.appendChild(listItem);

      // })
      // console.log('data', data);
  });

});
