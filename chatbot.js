document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById("chat-icon");
  const chatBox = document.getElementById("chat-box");
  const closeChat = document.getElementById("close-chat");
  const chatInput = document.getElementById("chat-input");
  const sendMsg = document.getElementById("send-msg");
  const chatBody = chatBox?.querySelector(".chat-body");

  if (!chatIcon || !chatBox) {
    console.error("❌ Chatbot: Elementos não encontrados no DOM");
    return;
  }

  // Abre/fecha chat
  chatIcon.addEventListener("click", () => {
    chatBox.classList.toggle("d-none");
  });

  closeChat?.addEventListener("click", () => {
    chatBox.classList.add("d-none");
  });

  // Enviar mensagem
  sendMsg?.addEventListener("click", () => {
    if (chatInput.value.trim() === "") return;

    const userMsg = document.createElement("div");
    userMsg.className = "msg";
    userMsg.textContent = chatInput.value;
    chatBody.appendChild(userMsg);
    chatInput.value = "";

    const botReply = document.createElement("div");
    botReply.className = "msg bot";
    botReply.textContent = "Obrigado! Em breve um atendente responderá.";
    chatBody.appendChild(botReply);

    chatBody.scrollTop = chatBody.scrollHeight;
  });

  // Enter também envia
  chatInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMsg.click();
    }
  });
});
