document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';

        const icon = document.createElement('i');
        icon.className = isUser ? 'fas fa-user' : 'fas fa-robot';
        avatar.appendChild(icon);

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        // **Crucial for Line Breaks & Formatting: Render Markdown**
        messageContent.innerHTML = marked.parse(message); // Renders Markdown, including line breaks

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        chatMessages.appendChild(messageDiv);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show typing indicator (no changes needed)
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicator.appendChild(dot);
        }

        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove typing indicator (no changes needed)
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Function to send message to the server (no changes needed)
    async function sendMessage(message) {
        try {
            showTypingIndicator();

            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: message }),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }

            const data = await response.json();
            removeTypingIndicator();
            addMessage(data.response);
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again later.');
        }
    }

    // Event listener for send button (no changes needed)
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            sendMessage(message);
        }
    });

    // Event listener for Enter key (no changes needed)
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                addMessage(message, true);
                userInput.value = '';
                sendMessage(message);
            }
        }
    });

    // Focus on input when page loads (no changes needed)
    userInput.focus();
});