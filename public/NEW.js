document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const chatMessages = document.getElementById("chat-messages");

    // Function to append messages to the chat window
    function addMessage(content, isUser) {
        const message = document.createElement("div");
        message.classList.add("message", isUser ? "user-message" : "bot-message");

        const avatar = document.createElement("div");
        avatar.classList.add("avatar");
        avatar.innerHTML = `<i class="fas fa-${isUser ? "user" : "robot"}"></i>`;

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
        messageContent.innerHTML = `<p>${content}</p>`;

        message.appendChild(avatar);
        message.appendChild(messageContent);
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to send the user input to the API
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;
        
        // Append the user message to the chat
        addMessage(message, true);
        userInput.value = "";

        // API call with CORS headers
        fetch("http://late-abbye-satyas89-4e962744.koyeb.app/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://127.0.0.1:5500", // Replace with your development environment's URL
            },
            body: JSON.stringify({ userInput: message })
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data.response, false);
        })
        .catch(error => {
            console.error("Error:", error);
            addMessage("Sorry, something went wrong. Please try again.", false);
        });
    }

    // Send the message when button is clicked or enter is pressed
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});