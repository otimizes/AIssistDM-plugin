document.addEventListener("DOMContentLoaded", function () {
  const connectButton = document.getElementById("connectWebSocket")
  const disconnectButton = document.getElementById("disconnectWebSocket")
  const promptButton = document.getElementById("sendTestMessage")
  const statusText = document.getElementById("status")

  // Update the status text in the popup for the first time
  chrome.runtime.sendMessage({ action: "status" }, (response) => {
    updateStatus(response.status)
  })

  // Function to update the status text in the popup
  function updateStatus(status) {
    switch (status) {
      case 0:
        statusText.innerText = "Connecting..."
        break
      case 1:
        statusText.innerText = "Connected"
        break
      case 2:
        statusText.innerText = "Closing..."
        break
      case 3:
        statusText.innerText = "Not connected"
        break
      default:
        statusText.innerText = "Error"
    }
  }

  // Handle click event for connect button
  connectButton.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "connect" }, (response) => {
      updateStatus(response.status)
    })
  })

  // Handle click event for disconnect button
  disconnectButton.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "disconnect" }, (response) => {
      updateStatus(response.status)
    })
  })

  // Handle click event for test prompt button
  promptButton.addEventListener("click", async () => {
    const promptMessage = {
      action: "GPT_PROMPT",
      content: "Olá, como vai?",
    }

    chrome.runtime.sendMessage(promptMessage, (response) => {})
  })

  // Periodically check WebSocket status
  setInterval(async () => {
    chrome.runtime.sendMessage({ action: "status" }, (response) => {
      updateStatus(response.status)
    })
  }, 1000)
})
