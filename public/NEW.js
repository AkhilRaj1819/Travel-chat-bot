document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        // Create message container
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-container ${isUser ? 'user-container' : 'bot-container'}`;
        
        // Create the message bubble
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`;
        
        // Format the message by removing asterisks and processing markdown-like syntax
        const formattedMessage = formatMessage(message);
        
        // Set the message content
        messageBubble.innerHTML = formattedMessage;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestamp.textContent = time;
        
        // Assemble the message components
        messageDiv.appendChild(messageBubble);
        messageDiv.appendChild(timestamp);
        
        // Add to chat container
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to format message text
    function formatMessage(text) {
        // Remove asterisks
        let formatted = text.replace(/\*\*/g, '');
        
        // Convert URLs to clickable links
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Add line breaks for readability
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'message-container bot-container';
        indicatorContainer.id = 'typing-indicator-container';
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator bot-bubble';
        indicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'typing-dot';
            indicator.appendChild(dot);
        }
        
        indicatorContainer.appendChild(indicator);
        chatMessages.appendChild(indicatorContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-container');
        if (indicator) {
            indicator.remove();
        }
    }

    // Function to send message to the server
    async function sendMessage(message) {
        try {
            showTypingIndicator();
            
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: message }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
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

    // Function to clear chat history
    function clearChat() {
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
        // Add welcome message
        addMessage('Hello! How can I assist you today?');
    }

    // Event listener for send button
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            sendMessage(message);
        }
    });

    // Event listener for Enter key
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

    // Add initial welcome message
    addMessage('Hello! How can I assist you today?');

    // Focus on input when page loads
    userInput.focus();
});