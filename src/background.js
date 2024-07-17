"use strict"

let socket

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "connect") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendResponse({ status: 0 })
    } else {
      socket = new WebSocket("ws://localhost:3000")

      sendResponse({ status: 0 })

      socket.onopen = function () {
        keepAlive(true)
      }

      socket.onmessage = async function (event) {
        console.debug("Received:", event.data)
        let msg = JSON.parse(event.data)
        if (msg.from === "CLIENT") {
          const tabId = await getTabIdByTitle("ChatGPT")
          handleGptPrompt(tabId, msg)
        }
      }

      socket.onclose = function () {}

      socket.onerror = function (error) {
        console.error("WebSocket error:", error)
      }
    }
    return true
  }

  if (message.action === "disconnect") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendResponse({ status: 2 })
      socket.close()
      keepAlive(false)
    }
    return true
  }

  if (message.action === "GPT_PROMPT") {
    try {
      sendResponse({ status: "Prompt handled" })
      const tabId = await getTabIdByTitle("ChatGPT")
      handleGptPrompt(tabId, message)
    } catch (error) {
      sendResponse({ status: "Gpt tab not found" })
    }
  }

  if (message.action === "GPT_ANSWER") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify(message, (key, value) => {
          if (key === "action") {
            return undefined
          }
          return value
        }),
      )
      console.debug("Message sent: ", message.content)
      sendResponse({ status: "Message sent" })
    } else {
      sendResponse({ status: "WebSocket not connected" })
    }
  }

  if (message.action === "status") {
    if (!socket)
      sendResponse({
        status: 3,
      })
    else sendResponse({ status: socket.readyState })
  }
})

const getTabIdByTitle = (title) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, (tabs) => {
      const tab = tabs.find((tab) => tab.title === title)
      if (tab) {
        resolve(tab.id)
      } else {
        reject("Tab not found")
      }
    })
  })
}

const handleGptPrompt = (tabId, msg) => {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (content) => {
      document.getElementById("prompt-textarea").value = content
      document
        .getElementById("prompt-textarea")
        .dispatchEvent(new Event("input", { bubbles: true }))
      document
        .querySelector('button[data-testid="fruitjuice-send-button"]')
        .click()

      const interval = setInterval(() => {
        let isGenerating = document.querySelector(
          'button[aria-label="Stop generating"]',
        )
        if (!isGenerating) {
          let last = document.querySelectorAll(
            'div[data-message-author-role="assistant"]',
          ).length
          let content = document.querySelectorAll(
            'div[data-message-author-role="assistant"]',
          )[last - 1].textContent

          clearInterval(interval)
          chrome.runtime.sendMessage(
            { action: "GPT_ANSWER", from: "CHAT_GPT", content: content },
            function (response) {},
          )
        }
      }, 3000)
    },
    args: [msg.content],
  })
}

const keepAlive = ((i) => (state) => {
  if (state && !i) {
    if (performance.now() > 20e3) chrome.runtime.getPlatformInfo()
    i = setInterval(chrome.runtime.getPlatformInfo, 20e3)
  } else if (!state && i) {
    clearInterval(i)
    i = 0
  }
})()
