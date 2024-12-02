document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save");
    const apiKeyInput = document.getElementById("apiKey");
    const numWordsInput = document.getElementById("numWords")
   
    // Load and display the stored API key (optional, for user convenience)
    chrome.storage.local.get("apiKey", (data) => {
      if (data.apiKey) {
        apiKeyInput.value = data.apiKey;
      }
    });
    chrome.storage.local.get("numWords", (data) => {
      if (data.numWords) {
        numWordsInput.value = data.numWords;
      }
    });
  
    // Save the API key when the button is clicked
    saveButton.addEventListener("click", () => {
      const apiKey = apiKeyInput.value.trim();
      const numWords= parseInt(numWordsInput.value, 10);
      if (apiKey) {
        chrome.storage.local.set({ apiKey, numWords }, () => {
          alert("Settings saved successfully!");
        });
      } else {
        alert("Please enter a valid API key and number of words.");
      }
    });
  });
  
  