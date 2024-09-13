// API
const API_KEY = `AIzaSyBLbFOY8JRQgZae4i1VCrML1CSFS2JgVAE`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const typingForm = document.querySelector(".typing-form");
const chat = document.querySelector(".chat");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.getElementById("toggle-theme-button");
const deleteChatButton = document.getElementById("delete-chat-button");

let userMessage = null;

const loadLocalStorageData = () => {
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";
  const savedChat = localStorage.getItem("savedChat");
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  chat.innerHTML = savedChat || "";
  chat.scrollTo(0, chat.scrollHeight); //scroll to bottom

  document.body.classList.toggle("hide-header", savedChat);
};
loadLocalStorageData();
//Message Element Creator

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Show typing effect

const showTypingEffect = (html, textElement) => {
  const words = html.split(" ");
  let currentWordIndex = 0;

  // Empty the textElement initially
  textElement.innerHTML = "";

  const typingInterval = setInterval(() => {
    textElement.innerHTML +=
      (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      localStorage.setItem("savedChat", chat.innerHTML);
    }
    chat.scrollTo(0, chat.scrollHeight); //scroll to bottom
  }, 45);
};
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

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

    const data = await response.json();

    const apiResponse = data?.candidates[0]?.content?.parts[0]?.text;
    console.log(apiResponse);

    // Convert Markdown-like syntax to HTML
    const formattedResponse = apiResponse
      .replace(/\*\*\s*(.*?)\s*\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/(\d+)\./g, "$1.<br>")
      .replace(/(^|\s)\*(.*?)(\s|$)/g, "$1• $2$3"); // for bullet points

    // Apply the typing effect with formatted HTML
    showTypingEffect(formattedResponse, textElement);
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
          <pre class="text"></pre>
          <div class="loading-indicator">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
          </div>
        </div>
        <span onclick = copyResponse(this) title="Copy" class="material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "in", "loader");
  chat.appendChild(incomingMessageDiv);
  chat.scrollTo(0, chat.scrollHeight); //scroll to bottom

  generateAPIResponse(incomingMessageDiv);
};
// Content Copy
window.copyResponse = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = "done";
  setTimeout(() => (copyIcon.innerText = `content_copy`), 1000);
};

//Outgoing Chat

const handleOutgoingChat = () => {
  userMessage =
    typingForm.querySelector(".prompt-input").value.trim() || userMessage;

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
  chat.scrollTo(0, chat.scrollHeight); //scroll to bottom
  document.body.classList.add("hide-header");
  setTimeout(showLoadingAnimation, 300);
};

// suggestions.forEach(suggestion, () => {
//   suggestion.addEventListener("click", () => {
//     userMessage = suggestion.querySelector("h4").innerText;
//     handleOutgoingChat();
//   });
// });

toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");

  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure about that?")) {
    localStorage.removeItem("savedChat");
    loadLocalStorageData();
  }
});

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});