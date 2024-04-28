let socket;

function connectWebSocket(tabId, callback) {
  socket = new WebSocket("ws://localhost:3000"); // Replace with your WebSocket server URL
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log("ONMESAAAGEEE -=---", request, sender, sendResponse);
    socket.send(JSON.stringify(request));
    sendResponse({ farewell: "goodbye" });
  });

  socket.onopen = function () {
    console.log("WebSocket connection established");
    callback("Connected");
  };

  socket.onmessage = function (event) {
    console.log(">>>>>>>>>>>>>>>>>>>>Message received: ", event.data);
    let msg = JSON.parse(event.data);
    if (msg.from === "CLIENT") window.sendMessage(tabId, msg);

    // callback("Message", event.data)
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `Connection closed cleanly, code=${event.code}, reason=${event.reason}`
      );
    } else {
      // e.g., server process killed or network down
      console.log("Connection died");
    }
    callback("Disconnected");
  };

  socket.onerror = function (error) {
    console.error(`WebSocket error: ${error.message}`);
    callback("Error");
  };
}

// Expose the function to the popup
window.connectWebSocket = connectWebSocket;
window.sendMessage = function setMessage(tabId, msg) {
  console.log("-------window.sendMessage", tabId, msg);
  if (msg.from !== "CLIENT") return;
  chrome.tabs.executeScript(
    tabId,
    {
      code: `
      console.log("FOIIIIIIIIIIIII");
      console.log("aquiiii2222");
      console.log(document.getElementById('prompt-textarea'));
      document.getElementById('prompt-textarea').value = "${msg.content}";
      document.getElementById('prompt-textarea').dispatchEvent(new Event('input', {bubbles: true}));
      document.querySelector('button[data-testid="send-button"]').click();

      interval = setInterval(() => {
          console.log("Checking generating");
          let isGenerating = document.querySelector('button[aria-label="Stop generating"]');
          if (!isGenerating) {
              console.log("Stoping generating");
              let last = document.querySelectorAll('div[data-message-author-role="assistant"]').length;
              let content = document.querySelectorAll('div[data-message-author-role="assistant"]')[last - 1].textContent;
              
              clearInterval(interval)
              chrome?.runtime?.sendMessage({from: 'CHAT_GPT', content: content}, function(response) {
                console.log(response);
              });
              console.log("CONTENT generated >", content)
          }
      }, 3000)

      
      `,
    },
    function () {
      // chrome.tabs.executeScript(null, { file: "content.js" });
    }
  );
};
