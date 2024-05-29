
const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageTone = new Audio('/Nada Dering Iphone Pangilan Masuk.mp3')
const connectButton = document.getElementById('connect-button');
const usernameInput = document.getElementById('username-input');
const emailInput = document.getElementById('email-input');
connectButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const email = emailInput.value;

    if (username && email) {
        createSocketConnection(username, email);
    } else {
        alert('Please enter both username and email.');
    }

});

let selectedUser='';
  // Function to handle click on user
  function handleUserClick(userId) {
    console.log('User ID:', userId);
    selectedUser=userId;
    // Add any additional logic you need here
}
async function createSocketConnection(username, email) {
    const socket = await io({
        query: {
            username: username,
            email: email
        }
    });
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage()
    })


    socket.on('clients-total', (data) => {
        console.log(data)

        clientsTotal.innerText = `Total Clients:${data}`

    })

    socket.on('users', (data) => {
        console.log("users:", data);
        data = data.filter(item => item.username != username);
        console.log(data);
        clearUsers()
      


        data.forEach((item) => {
            const usersList = document.getElementById('usersList')
            const element = `<li class="active-user" onClick="handleUserClick('${item.id}')">${item.username}
                            </li>
                            `
            usersList.innerHTML += element;
        })





    })



    function sendMessage() {
        if (messageInput.value === '') return
        // console.log(messageInput.value)
        const data = {
            name: nameInput.value,
            message: messageInput.value,
            targetId:selectedUser,
            dateTime: new Date()

        }
        // socket.emit('message', data);
        socket.emit('private-message', data);
        addMessageToUI(true, data);
        messageInput.value = '';
    }


    socket.on('chat-message', (data) => {
        clearFeedback()
        messageTone.play()
        addMessageToUI(false, data)
    })
    socket.on('private-message', (data) => {
        console.log(data)
        clearFeedback()
        messageTone.play()
        addMessageToUI(false, data)
    })
    function addMessageToUI(isOwnMessage, data) {

        const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
                ${data.message}
                <span>${data.name} ${data.dateTime}</span>
            </p>
        </li>`


        messageContainer.innerHTML += element;
        scrollToBottom()
    }

    function scrollToBottom() {
        messageContainer.scroll(0, messageContainer.scrollHeight)
    }

    messageInput.addEventListener('focus', (e) => {

        socket.emit('feedback', { feedback: `${nameInput.value} is typing a message` })
    });
    messageInput.addEventListener('keypress', (e) => {

        socket.emit('feedback', { feedback: `${nameInput.value} is typing a message` })
    });
    messageInput.addEventListener('blur', (e) => {
        socket.emit('feedback', { feedback: '' })
    })


    socket.on('feedback', (data) => {
        clearFeedback()
        addFeedBack(data.feedback)
    })


    function addFeedBack(feedback) {
        console.log("feedback by:", feedback)
        const element = `
                <li class="mesage-feedback" id="mesage-feedback">
        
                        <p class="feedback" id="feedback">${feedback}</p>
                </li>`

        messageContainer.innerHTML += element

    }

    function clearFeedback() {
        const elements = document.querySelectorAll('li.mesage-feedback');
        elements.forEach((element) => {

            element.parentNode.removeChild(element)
        })
    }
    function clearUsers() {
        const elements = document.querySelectorAll('li.active-user');
        elements.forEach((element) => {

            element.parentNode.removeChild(element)
        })
    }
}