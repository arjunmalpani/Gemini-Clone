// API
const API_KEY = `AIzaSyBLbFOY8JRQgZae4i1VCrML1CSFS2JgVAE`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const typingForm = document.querySelector(".typing-form");
const chat = document.querySelector(".chat");

let userMessage = null;

//Message Element Creator

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Show typing effect

const showTypingEffect = (text, textElement) => {
  const words = text.split(" ");

  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    textElement.innerText +=
      (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
    }
  }, 45);
};

// Generate API response

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  // Async Response
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });
    // Json to text
    const data = await response.json();

    const apiResponse = data?.candidates[0].content.parts[0].text;
    // console.log(apiResponse);
    // textElement.innerText = apiResponse;
    showTypingEffect(apiResponse, textElement);
  } catch (error) {
    console.log(error);
  } finally {
    incomingMessageDiv.classList.remove("loader");
  }
};
//Loading Animation

const showLoadingAnimation = () => {
  const html = `<div class="message-content">
          <img src="./images/gemini.png" alt="gemini" class="avatar" />
          <p class="text"></p>
          <div class="loading-indicator">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
          </div>
        </div>
        <span class="material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "in", "loader");
  chat.appendChild(incomingMessageDiv);

  generateAPIResponse(incomingMessageDiv);
};

//Outgoing Chat

const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".prompt-input").value.trim();

  if (!userMessage) return;

  console.log(userMessage);

  const html = `<div class="message out">
        <div class="message-content">
          <img src="./images/user.png" alt="User" class="avatar" />
          <p class="text"></p>
        </div>
      </div>`;

  const outgoingMessageDiv = createMessageElement(html, "out");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chat.appendChild(outgoingMessageDiv);

  //reset and Timeout

  typingForm.reset();
  setTimeout(showLoadingAnimation, 300);
};

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
