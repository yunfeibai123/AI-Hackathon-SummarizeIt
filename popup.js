document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save");
    const apiKeyInput = document.getElementById("apiKey");
    const numWordsInput = document.getElementById("numWords");
   
    // Load and display the stored settings
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

    // Ultra Modern Toast Notification Function
    const createToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = 'neo-toast';
        
        // Add animation and styling
        const style = document.createElement('style');
        style.textContent = `
            @keyframes neoSlideIn {
                0% { 
                    transform: translate(-50%, 80px) rotateX(45deg);
                    opacity: 0;
                    filter: blur(10px);
                }
                100% { 
                    transform: translate(-50%, 0) rotateX(0);
                    opacity: 1;
                    filter: blur(0);
                }
            }
            @keyframes neoSlideOut {
                0% {
                    transform: translate(-50%, 0) rotateX(0);
                    opacity: 1;
                    filter: blur(0);
                }
                100% { 
                    transform: translate(-50%, -80px) rotateX(-45deg);
                    opacity: 0;
                    filter: blur(10px);
                }
            }
            @keyframes glowPulse {
                0%, 100% { box-shadow: 0 8px 32px rgba(var(--glow-color), 0.2); }
                50% { box-shadow: 0 8px 32px rgba(var(--glow-color), 0.6); }
            }
            @keyframes borderFlow {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
            }
            .neo-toast {
                --glow-color: ${type === 'success' ? '46, 213, 115' : '255, 71, 87'};
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 16px 30px;
                min-width: 300px;
                background: rgba(17, 24, 39, 0.95);
                border-radius: 16px;
                color: #fff;
                font-size: 14px;
                font-weight: 500;
                z-index: 9999;
                animation: neoSlideIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 8px 32px rgba(var(--glow-color), 0.2);
                animation: glowPulse 2s infinite;
            }
            .neo-toast::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 16px;
                padding: 1px;
                background: linear-gradient(
                    90deg,
                    rgba(var(--glow-color), 0.5),
                    rgba(var(--glow-color), 0.2),
                    rgba(var(--glow-color), 0.5)
                );
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                animation: borderFlow 3s linear infinite;
                background-size: 200% 200%;
            }
            .neo-toast-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgb(var(--glow-color));
                border-radius: 50%;
                font-size: 14px;
            }
            .neo-toast-content {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            .neo-toast-message {
                color: rgba(255, 255, 255, 0.95);
                font-weight: 500;
                letter-spacing: 0.3px;
            }
            .neo-toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(var(--glow-color), 0.3);
                border-radius: 0 0 16px 16px;
                overflow: hidden;
            }
            .neo-toast-progress::after {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgb(var(--glow-color));
                transform-origin: left;
                animation: progress 2s linear forwards;
            }
            @keyframes progress {
                0% { transform: scaleX(1); }
                100% { transform: scaleX(0); }
            }
        `;
        document.head.appendChild(style);

        // Create content structure
        toast.innerHTML = `
            <div class="neo-toast-icon"></div>
            <div class="neo-toast-content">
                <div class="neo-toast-message">
                    ${message}
                </div>
            </div>
            <div class="neo-toast-progress"></div>
        `;
        
        document.body.appendChild(toast);

        // Remove toast after animation
        setTimeout(() => {
            toast.style.animation = 'neoSlideOut 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards';
            setTimeout(() => {
                document.body.removeChild(toast);
                document.head.removeChild(style);
            }, 600);
        }, 2000);
    };

    // Create and style toggle button
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.textContent = 'Show';

    let isVisible = false;
    let actualValue = '';

    // Update toggle button state and input value
    function updatePasswordVisibility() {
        if (isVisible) {
            apiKeyInput.type = 'text';
            apiKeyInput.value = actualValue;
            togglePassword.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            apiKeyInput.value = actualValue;
            togglePassword.textContent = 'Show';
        }
    }

    // Toggle button click handler
    togglePassword.addEventListener('click', () => {
        isVisible = !isVisible;
        updatePasswordVisibility();
    });

    // Input handler
    apiKeyInput.addEventListener('input', function() {
        actualValue = this.value;
    });

    // Load stored API key
    chrome.storage.local.get("apiKey", (data) => {
        if (data.apiKey) {
            actualValue = data.apiKey;
            apiKeyInput.value = data.apiKey;
            apiKeyInput.type = 'password';
        }
    });

    // Save settings with enhanced notification
    saveButton.addEventListener("click", () => {
        const apiKey = actualValue.trim();
        const numWords = parseInt(numWordsInput.value, 10);

        if (apiKey && !isNaN(numWords) && numWords > 0) {
            chrome.storage.local.set({ apiKey, numWords }, () => {
                createToast('Settings saved successfully', 'success');
                if (!isVisible) {
                    apiKeyInput.value = apiKey;
                }
            });
        } else {
            createToast('Please enter valid settings', 'error');
        }
    });
});
  
  