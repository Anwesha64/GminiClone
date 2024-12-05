const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");


let userMessage = null;


// API configuration
const API_KEY = "AIzaSyAU5EH-CnElwT5T2ENmEFjiJ2wiTLz1gWA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () => {
    // const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    // Restore saved chats
    // chatList.innerHTML = savedChats || "";
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
}

loadLocalstorageData();

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        // Append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.remove("hide");

        // If all words are displayed
        if(currentWordIndex === words.length) {
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").chatList.add("hide");
            // localStorage.setItem("savedChats", chatList.innerHTML); // Save chats to local storage
            chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
        }
    }, 75);
}

// Fetch response from the API based on user's message
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text"); // Get text element
    // send a POST requet to the API with user's message
    try {
        const response = await fetch(API_URL, {
          method: "POST" ,
          headers: {"Content-Type" : "application/json"},
          body: JSON.stringify({
            contents: [{
                role: "user",
                parts: [{ text: userMessage }]
            }]
          })
        });

        const data = await response.json();

        // Get the API response text and remove asterisks from it
        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);
        // console.log(apiResponse);
        // textElement.innerText = apiResponse;
    }   catch (error) {
        console.log(error); 
    }   finally {
        incomingMessageDiv.classList.remove("loading"); 
    }
}

//Show a loading animation while  waiting for the API
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                <img src="gemini.svg" alt="Gemini Image"
                class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;
    // console.log(userMessage);

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
    generateAPIResponse(incomingMessageDiv);
}

// Copy message text to the clipboard
const copyMessage  = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; // Show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // Revert icon after 1 second
}


// Handel sending outgoing chat message
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) return; // Exit if there is no message

    const html = `<div class="message-content">
                <img src="images.png" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`
    // console.log(userMessage);

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // clear input field
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

// Toggle between light and dark themes
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Prevent default form submission and handel outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
});