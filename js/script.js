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
    inputFile = document.querySelector('#inputFile'),
    avatarImage = document.querySelector('#avatarImage');

    users = [],
    messagesListOnPage = [],

    socket = io.connect('http://localhost:3000/');

  socket.on('connected', function (userList, messages) {
    console.log('messages', messages)

    if(userList.length !== 0) {
      users = userList;
    }
    if(messages.length !== 0) {
      messagesListOnPage = messages;
    }
  });

  socket.on('message', addMessage);

  sendBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let messageData = messageText.value.trim();

    if(messageData.length == 0){
      
      messageText.classList.add('message__form_input-error');
    }

    socket.emit('msg', messageData);
    messageText.value = '';
  });

  function addMessage(message){

    users.forEach(({nickname, username, avatar}) => {

      if( message.username == username) {
        message.username = nickname;

        if (avatar === undefined) {
          message.src = `./img/default-avatar.png`;
          return;
        }

        message.src = `./img/avatars/${avatar}`;
      }
    })
    
    messagesListOnPage.push(message);
    let messagesList = renderMessages(messagesListOnPage);
          messages.innerHTML = messagesList;
          messageContainer.scrollTop = messageContainer.scrollHeight;
    
  }

  function isCurrentUser (users, activeUser) {
    
    let index = users.findIndex(user => user.nickname === activeUser.nickname);

    return index;

    // console.log(index)
    // return (index !== -1) ? true : false;
  }

  authBtn.addEventListener('click', (e) => {
      e.preventDefault(); // prevents page reloading
      console.log('auth btn click')

      let currentUser = {name: name.value, nickname: nickname.value, username: socket.id}

      if(users.length === 0 ) {
        socket.emit('add user', currentUser);
      } else {
        let current = isCurrentUser(users, currentUser) //returns index of user if it is in DB

        if (current === -1) {
            socket.emit('add user', currentUser); 
            let usersActiveList = renderUsers(users);
            console.log('here')
            usersList.innerHTML = usersActiveList;
        }
        if (current !== -1) {
          let usersActiveList = renderUsers(users);
          usersList.innerHTML = usersActiveList;

          users[current].avatar = (users[current].avatar !== undefined) ? user.avatar : 'default-avatar.png'

          avatarImage.src = `./img/avatars/${users[current].avatar}`
          usersBlock.classList.add('users__block_image-add');
          photoText.classList.add('no_photo-o');
        }
      }


      if(messagesListOnPage.length !== 0) {
        console.log(messagesListOnPage)
        messagesListOnPage.forEach(addMessage);
      }



      // } else {
      //     users.forEach(user => {
      //     if (user.nickname !== nickname.value) {
      //       socket.emit('add user', currentUser); 
      //       let usersActiveList = renderUsers(users);
      
      //       usersList.innerHTML = usersActiveList;
      //     } else if (user.nickname === nickname.value) {
      //       let usersActiveList = renderUsers(users);
      //       debugger
      
      //       usersList.innerHTML = usersActiveList;

      //       user.avatar = (user.avatar !== undefined) ? user.avatar : 'default-avatar.png'

      //       avatarImage.src = `./img/avatars/${user.avatar}`
      //       usersBlock.classList.add('users__block_image-add');
      //       photoText.classList.add('no_photo-o');
      //     }
      //   })
      // }




      nameOfuser.textContent = nickname.value;
      authPopup.style.display = 'none';
      name.value = '';
      nickname.value = '';
      messageText.removeAttribute('disabled');
      sendBtn.removeAttribute('disabled');
  })

  // <<<<<<<<<< аватар

  loadPhoto.addEventListener('click', (e) => {
    e.preventDefault(); // prevents page reloading
    fileLoadPopup.classList.add('active')
  });

  cancel.addEventListener('click', (e) => {
    e.preventDefault(); // prevents page reloading
    fileLoadPopup.classList.remove('active')
  });

  inputFile.addEventListener('change', (evt) => {

    var reader = new FileReader();

    reader.onload = function (e) {
        // get loaded data and render thumbnail.
        document.querySelector('#image').src = e.target.result;
        document.querySelector('#image').classList.add('image_input-add');
        document.querySelector('.fileload__modal_input').classList.add('no-before');

    };

    // read the image file as a data URL.
    reader.readAsDataURL(evt.target.files[0]);

    socket.emit('upload file', evt.target.files[0].name, evt.target.files[0], socket.id);

  });

    let photoText = document.querySelector('.no_photo');
    let usersBlock = document.querySelector('.users__block_image');

  sendPhoto.addEventListener('click', (evt) => {
    evt.preventDefault();

    let image = document.querySelector('#image').src


    if(image !== '') {
      avatarImage.src = image;
      photoText.classList.add('no_photo-o');
      document.querySelector('#image').src = '';
      fileLoadPopup.classList.remove('active');
      usersBlock.classList.add('users__block_image-add');
    }

  });

  // >>>>>>>>>>> аватар

  socket.on('user joined', (user) => {

    // users.forEach(currentUser => {
    //   if (currentUser.name === user.name) {
        users.push(user);
    //   }
    // })

      let usersActiveList = renderUsers(users);
      
      usersList.innerHTML = usersActiveList;
  });
  

  socket.on('uploaded file', (userlist) => {
      users = userlist;
  });
});
