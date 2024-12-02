// Create a context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize_s",
    title: "Summarize Selected Text in Paragraph",
    contexts: ["selection"] // Trigger when text is selected
  });

    // Second context menu: Translate selected text
    chrome.contextMenus.create({
    id: "summarize_b",
    title: "Summarize Selected Text in Bullet Points",
    contexts: ["selection"] // Trigger when text is selected
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "summarize_s") {
    const selectedText = info.selectionText;
    const format = 'paragraph';

    if (selectedText) {
      const [summary,errorflag] = await summarizeText(selectedText,format);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displaySummary,
        args: [summary,errorflag]
      });
    }
  };
  if (info.menuItemId === "summarize_b") {
    const selectedText = info.selectionText;
    const format = 'bullet points';

    if (selectedText) {
      const [summary,errorflag] = await summarizeText(selectedText,format);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displaySummary,
        args: [summary,errorflag]
      });
    }
  };
});


//get stored API key
function getStorageData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}


// Summarize the selected text using OpenAI API
async function summarizeText(text,format) {

  try {

    //get stored API key
    const apiKey = await getStorageData("apiKey");
    const numWords = await getStorageData("numWords");
    if (!apiKey) {
      console.error("No API key found. Please set it in the popup.");
      return;
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "system",
            "content": `You are a summarization assistant.
            First, determine language of the user content, and generate the contents only in this language. \
            Second, Summarize user's content clearly and concisely, in format of ${format}. \
            The result must be completed within ${numWords} words.`
          },
          { 
            "role": "user", 
            "content": text
          }
        ],
        max_tokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return [data.choices[0].message.content.trim(),0];
      } else {
        return ["Failed to generate a summary.",1];
      }
    } else {
      // Handle non-200 responses
      console.error("Error:", response.status, response.statusText);
      const errorData = await response.json(); // Parse the error response
      const errorDetails = errorData['error']['message']
      console.error("Error details:",errorDetails);
      return [errorDetails,1];
    }

  } catch (error) {
    // Handle network or other unexpected errors
    console.error("Fetch error:", error);
  }
}

// Function to display the summary on the page
function displaySummary(contents,errorflag) {
  // Create a simple div to show the summary
  const summaryDiv = document.createElement("div");
  summaryDiv.style.position = "fixed";
  summaryDiv.style.bottom = "10px";
  summaryDiv.style.right = "10px";
  summaryDiv.style.padding = "15px";
  summaryDiv.style.backgroundColor = "white";
  summaryDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  summaryDiv.style.borderRadius = "5px";
  summaryDiv.style.zIndex = "10000";
  summaryDiv.style.fontFamily = "Arial, sans-serif";
  summaryDiv.style.color = "#333";
  summaryDiv.style.maxWidth = "300px";
  if (errorflag) {
    summaryDiv.innerText = `Error:\n\n${contents}`;
  } else {
    summaryDiv.innerText = `Summary:\n\n${contents}`;
  }
  

  // Add a close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.marginTop = "10px";
  closeButton.style.padding = "5px 10px";
  closeButton.style.backgroundColor = "#007BFF";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "3px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(summaryDiv);
  });

  summaryDiv.appendChild(closeButton);
  document.body.appendChild(summaryDiv);
}
