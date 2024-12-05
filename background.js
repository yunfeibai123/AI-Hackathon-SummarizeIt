// Create a context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize_s",
    title: "In Paragraph",
    contexts: ["selection"] // Trigger when text is selected
  });

    // Second context menu: Translate selected text
    chrome.contextMenus.create({
    id: "summarize_b",
    title: "In Bullet Points",
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
function displaySummary(contents, errorflag) {
  // Create wrapper div
  const summaryDiv = document.createElement("div");
  summaryDiv.style.position = "fixed";
  summaryDiv.style.bottom = "30px";
  summaryDiv.style.right = "30px";
  summaryDiv.style.padding = "20px";
  summaryDiv.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  summaryDiv.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
  summaryDiv.style.borderRadius = "15px";
  summaryDiv.style.zIndex = "10000";
  summaryDiv.style.fontFamily = "'Poppins', sans-serif";
  summaryDiv.style.maxWidth = "400px";
  summaryDiv.style.backdropFilter = "blur(10px)";
  summaryDiv.style.border = "1px solid rgba(255,255,255,0.3)";
  summaryDiv.style.transition = "all 0.3s ease";
  summaryDiv.style.animation = "slideIn 0.3s ease-out";

  // Add styles for animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }
  `;
  document.head.appendChild(style);

  // Create header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "15px";
  header.style.paddingBottom = "10px";
  header.style.borderBottom = "1px solid rgba(0,0,0,0.1)";

  // Create title
  const title = document.createElement("div");
  title.style.fontWeight = "600";
  title.style.fontSize = "16px";
  title.style.color = errorflag ? "#ff4b2b" : "#2c3e50";
  title.innerText = errorflag ? "Error" : "Summary";

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.background = "none";
  closeButton.style.border = "none";
  closeButton.style.fontSize = "24px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#666";
  closeButton.style.padding = "0 5px";
  closeButton.style.lineHeight = "1";
  closeButton.style.transition = "color 0.3s ease";

  closeButton.onmouseover = () => closeButton.style.color = "#ff4b2b";
  closeButton.onmouseout = () => closeButton.style.color = "#666";

  // Create content
  const content = document.createElement("div");
  content.style.fontSize = "14px";
  content.style.lineHeight = "1.6";
  content.style.color = "#34495e";
  content.style.whiteSpace = "pre-wrap";
  content.innerText = contents;

  // Add copy button
  const copyButton = document.createElement("button");
  copyButton.innerText = "Copy";
  copyButton.style.marginTop = "15px";
  copyButton.style.padding = "8px 15px";
  copyButton.style.backgroundColor = "#3498db";
  copyButton.style.color = "white";
  copyButton.style.border = "none";
  copyButton.style.borderRadius = "5px";
  copyButton.style.cursor = "pointer";
  copyButton.style.transition = "all 0.3s ease";
  copyButton.style.fontSize = "12px";

  copyButton.onmouseover = () => {
    copyButton.style.backgroundColor = "#2980b9";
    copyButton.style.transform = "translateY(-1px)";
  };
  copyButton.onmouseout = () => {
    copyButton.style.backgroundColor = "#3498db";
    copyButton.style.transform = "translateY(0)";
  };

  copyButton.onclick = () => {
    navigator.clipboard.writeText(contents);
    copyButton.innerText = "Copied!";
    setTimeout(() => copyButton.innerText = "Copy", 2000);
  };

  // Assemble the components
  header.appendChild(title);
  header.appendChild(closeButton);
  summaryDiv.appendChild(header);
  summaryDiv.appendChild(content);
  summaryDiv.appendChild(copyButton);

  // Add close functionality
  closeButton.onclick = () => {
    summaryDiv.style.animation = "fadeOut 0.3s ease-in forwards";
    setTimeout(() => document.body.removeChild(summaryDiv), 300);
  };

  document.body.appendChild(summaryDiv);
}
