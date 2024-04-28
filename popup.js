chrome.runtime.getBackgroundPage((backgroundPage) => {
  document.getElementById("connectWebSocket").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      backgroundPage.connectWebSocket(tabs[0].id, (status, msg) => {
        document.getElementById("status").innerText = status;

        console.log("tabbbsss", tabs[0].id);
        console.log("------------>", status, " :::::::: ", msg);
      });
    });
  });
  document.getElementById("sendTestMessage").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      backgroundPage.sendMessage(tabs[0].id, "Short Test Message");
    });
  });
});
