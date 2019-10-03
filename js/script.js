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

    users.forEach(({nickname, username}) => {
      // console.log(users)
      if( message.username == username) {
        message.username = nickname;
      }
    })
    
    messagesListOnPage.push(message);
    let messagesList = renderMessages(messagesListOnPage);
          messages.innerHTML = messagesList;
          messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  authBtn.addEventListener('click', (e) => {
      e.preventDefault(); // prevents page reloading

      let user = {name: name.value, nickname: nickname.value, username: socket.id}

      socket.emit('add user', user);

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

  });

  sendPhoto.addEventListener('click', (evt) => {
    evt.preventDefault();

    let image = document.querySelector('#image').src
    let photoText = document.querySelector('.no_photo');
    let usersBlock = document.querySelector('.users__block_image')


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
      users.push(user);
      let usersActiveList = renderUsers(users);
      
      usersList.innerHTML = usersActiveList;
  });

});
