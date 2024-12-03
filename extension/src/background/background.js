// open side panel by default
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// send data from side panel to chrome local storage to offscreen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displayTranscripts") {
    chrome.storage.local.get(["title", "transcriptions"], (result) => {
      // delay data to offscreen
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: "updateOffscreen",
          title: result.title || "Untitled",
          transcriptions: result.transcriptions || [],
        }, (response) => {
          console.log("Background sent message, response:", response);
        });
      }, 500);
    });
  }

  sendResponse({ status: "Background received the message" });
});
