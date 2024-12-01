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
      const summary = await summarizeText(selectedText,format);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displaySummary,
        args: [summary]
      });
    }
  };
  if (info.menuItemId === "summarize_b") {
    const selectedText = info.selectionText;
    const format = 'bullet points';

    if (selectedText) {
      const summary = await summarizeText(selectedText,format);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displaySummary,
        args: [summary]
      });
    }
  };
});

// Summarize the selected text using OpenAI API
async function summarizeText(text,format) {
  const apiKey = "APIKEY"; // Replace with your OpenAI API key

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `In format of ${format}, Summarize this content in maximum 50 words: ${text}, and results must be in the same language with the summarized contents.` }],
      max_tokens: 100
    })
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  } else {
    return "Failed to generate a summary.";
  }
}

// Function to display the summary on the page
function displaySummary(summary) {
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
  summaryDiv.innerText = `Summary:\n\n${summary}`;

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
