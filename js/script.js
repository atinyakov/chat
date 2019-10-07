document.addEventListener('DOMContentLoaded', function () {
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

    messagesPhoto = document.querySelector('#messagesPhoto'),
    templateOfMessage = document.querySelector('#messageList').textContent,
    templateOfUsers = document.querySelector('#listOfUsers').textContent,
    renderUsers = Handlebars.compile(templateOfUsers),
    renderMessages = Handlebars.compile(templateOfMessage),
    inputFile = document.querySelector('#inputFile'),
    avatarImage = document.querySelector('#avatarImage');

    usersDB = [],
    messagesListOnPage = [],
    currentUsers = []

  socket = io.connect('http://localhost:3000/');

  let photoText = document.querySelector('.no_photo');
  let usersBlock = document.querySelector('.users__block_image');

  socket.on('connected', function (userList, messages, currentUsr) {

    if (userList.length !== 0) {
      usersDB = userList;
    }
    if (messages.length !== 0) {
      messagesListOnPage = messages;
    }

    if (currentUsr.length !== 0) {
      currentUsers = currentUsr;
    }
  });


  socket.on('userUpdate', data => {
    currentUsers = data;
    document.querySelector('#usersList').innerHTML = ''
    showUsers(currentUsers);
  });

  socket.on('userDBUpdate', data => {
    usersDB = data;
  });

  socket.on('message', msg => {
    addMessage(msg)
  });

  sendBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let messageData = messageText.value.trim();

    if (messageData.length == 0) {

      messageText.classList.add('message__form_input-error');
    }

    socket.emit('msg', messageData);
    messageText.value = '';
  });

  function addMessage(message) {
    messagesListOnPage.push(message);
    renderMsg(message)
  }

  function renderMsg(message) {

    usersDB.forEach(({
      nickname,
      avatar
    }) => {

      if (message.username == nickname) {
        message.src = `./img/avatars/${avatar}`;
      }
    })

    let messagesList = renderMessages(messagesListOnPage);

    messages.innerHTML = messagesList;
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function showUsers(users) {
    let usersActiveList = renderUsers(users);
    usersList.innerHTML = usersActiveList;
  }

  function isCurrentUser(usersDB, activeUser) {
    let index = usersDB.findIndex(user => user.nickname === activeUser.nickname);

    return index;
  }

  authBtn.addEventListener('click', (e) => {
    e.preventDefault(); // prevents page reloading

    let currentUser = {
      name: name.value,
      nickname: nickname.value,
      username: socket.id,
      avatar: 'default-avatar.png'
    }

    if (usersDB.length === 0) {
      socket.emit('add user', currentUser);
    } else {
      let current = isCurrentUser(usersDB, currentUser) //returns index of user if it is in DB

      if (current === -1) {
        socket.emit('add user', currentUser);
        showUsers(currentUsers);
      }
      if (current !== -1) {
        currentUsers.push(currentUser);

        socket.emit('update userlist', currentUser);
        socket.emit('update username', currentUser);

        avatarImage.src = `./img/avatars/${usersDB[current].avatar}`
        usersBlock.classList.add('users__block_image-add');
        photoText.classList.add('no_photo-o');
      }
    }

    if (messagesListOnPage.length !== 0) {
      messagesListOnPage.forEach(renderMsg);
    }

    nameOfuser.textContent = nickname.value;
    authPopup.style.display = 'none';
    name.value = '';
    nickname.value = '';
    messageText.removeAttribute('disabled');
    sendBtn.removeAttribute('disabled');
  })

  // <<<<<<<<<< avatar

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

  sendPhoto.addEventListener('click', (evt) => {
    evt.preventDefault();

    let image = document.querySelector('#image').src


    if (image !== '') {
      avatarImage.src = image;
      photoText.classList.add('no_photo-o');
      document.querySelector('#image').src = '';
      fileLoadPopup.classList.remove('active');
      usersBlock.classList.add('users__block_image-add');
    }

    document.querySelector('.fileload__modal_input').classList.remove('no-before');


    if (messagesListOnPage.length !== 0) {
      socket.emit('send update avatars')
    }

  });

  socket.on('update avatars', () => {
    document.querySelector('#messages').innerHTML = ''
    messagesListOnPage.forEach(renderMsg);
  })

  // >>>>>>>>>>> avatar

  socket.on('user joined', (user) => {
    usersDB.push(user);
    currentUsers.push(user);
    showUsers(currentUsers);
  });


  socket.on('uploaded file', (userlist) => {
    usersDB = userlist;
  });
});