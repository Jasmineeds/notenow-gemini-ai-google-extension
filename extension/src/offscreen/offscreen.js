import { ContentProcessor } from './content.js';
import { SVG_ICONS } from '../shared/constants.js';


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateOffscreen" && message.title && message.transcriptions) {
    console.log("Received transcriptions:", message.transcriptions);
    updateOffscreenUI(message.title, message.transcriptions);

    sendResponse({ status: "Offscreen processed the message" });
  }
  // return true to keep connection
  return true;
});

function updateOffscreenUI(title, transcriptions) {
  const container = document.getElementById("transcription-container");
  container.innerHTML = ''; // Clear existing content

  const el = document.querySelector('.title');
  el.innerHTML = title;

  transcriptions.forEach((item) => {
    // Create wrapper
    const contentWrapper = document.createElement("div");
    contentWrapper.className = 'content-wrapper';

    // Create main transcription container
    const transcriptionContainer = document.createElement("div");
    transcriptionContainer.className = 'transcription stopped';
    transcriptionContainer.setAttribute("data-key", item.key);

    // Create content div
    const contentDiv = document.createElement("div");
    contentDiv.className = 'transcription-content';
    contentDiv.textContent = item.content;

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = 'vertical-button-container';

    // Define buttons
    const buttons = [
      { svg: SVG_ICONS['list'], action: 'summarize' },
      { svg: SVG_ICONS['translate'], action: 'translate' },
      { svg: SVG_ICONS['pencil'], action: 'quiz' }
    ];

    // Create buttons
    buttons.forEach(({ svg, action }) => {
      const button = document.createElement("button");
      button.classList.add("action-btn");
      button.innerHTML = svg;
      button.setAttribute("data-action", action);

      // Add focused state if matches item's action
      if (item.focused && item.action === action) {
        button.classList.add('focused');
        transcriptionContainer.classList.add('focused');

        setTimeout(() => button.click(), 0);
      }

      buttonContainer.appendChild(button);
    });

    // Assemble the transcription container
    transcriptionContainer.appendChild(contentDiv);

    contentWrapper.appendChild(transcriptionContainer);
    contentWrapper.appendChild(buttonContainer);

    // Append to main container
    container.appendChild(contentWrapper);
  });

  // show clicked section
  container.addEventListener('click', (event) => {
    const button = event.target.closest('.action-btn');
    console.log(button)
    if (button) {
      const action = button.getAttribute('data-action');
      const section = button.closest('.content-wrapper');
      const transcription = section.querySelector('.transcription');
      const key = transcription.getAttribute('data-key');

      // Remove focus from all buttons and transcriptions
      document.querySelectorAll('.action-btn.focused').forEach((btn) => {
        btn.classList.remove('focused');
        btn.classList.remove('disabled');
      });
      document.querySelectorAll('.transcription.focused').forEach((trans) => {
        trans.classList.remove('focused');
      });

      // Add focus to the clicked button and its transcription
      button.classList.add('focused');
      button.classList.add('disabled');
      transcription.classList.add('focused');

      // Hide all panels first
      document.querySelectorAll('.action-container').forEach(panel => {
        panel.style.display = 'none';
        // Clear previous data-key
        panel.removeAttribute('data-key');
      });

      const targetPanel = document.getElementById(`${action}-panel`);
      if (targetPanel) {
        targetPanel.style.display = 'block';
        targetPanel.setAttribute('data-key', key);
      }
    }
  });
}

class ContentManager {
  constructor() {
    this.processor = new ContentProcessor();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // listen to transcription clicks
    document.getElementById("transcription-container")
      .addEventListener('click', this.handleContentClick.bind(this));

    // listen to language select (event delegate)
    document.addEventListener('change', this.handleLanguageChange.bind(this));

    // listen to action clicks
    document.querySelectorAll(".action-container").forEach(e => {
      e.addEventListener('click', this.handleActionClick.bind(this));
    });
  }

  async handleContentClick(e) {
    const button = e.target.closest('.action-btn');
    if (!button) return;

    const section = button.closest('.content-wrapper');
    const el = section.querySelector('.transcription');
    if (!el) return;

    const type = button.dataset.action;
    const key = el.getAttribute('data-key');
    const content = el.querySelector('.transcription-content').innerHTML;

    const result = await this.processor.processContent(content, key, type);
    this.processor.renderContent(type, result);
  }

  async handleLanguageChange(e) {
    const select = e.target.closest('#language-select');
    if (!select) return;

    const language = select.value;
    if (!language) return;

    const container = document.querySelector('.translate-container');
    const key = container.dataset.contentKey;
    const originalText = container.querySelector('.original-text').textContent;
    const translatedTextDiv = document.querySelector('.translated-text');

    try {
      const translation = await this.processor.translateContent(originalText, key, language);
      translatedTextDiv.textContent = translation;
    } catch (error) {
      translatedTextDiv.textContent = 'Oops, something wrong with translation.';
      console.error('Translation error:', error);
    }
  }

  async handleActionClick(e) {
    // Handle Copy Button
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const actionContainer = copyBtn.closest('.action-container');
      const contentDiv = actionContainer?.querySelector('.content'); // Scoped search

      if (contentDiv) {
        try {
          await navigator.clipboard.writeText(contentDiv.textContent.trim());
          console.log('Text copied:', contentDiv.textContent.trim());
          this.animateIcon(copyBtn); // Pass the button for animation

          // show popup
          const popup = document.getElementById('copy-popup');
          popup.classList.add('show');

          // hide popup
          setTimeout(() => {
            popup.classList.remove('show');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
      } else {
        console.warn('No .content element found.');
      }
      return;
    }

    // Handle Regenerate Button
    const regenBtn = e.target.closest('.regenerate-btn');
    if (regenBtn) {
      const actionContainer = regenBtn.closest('.action-container');
      const contentDiv = actionContainer?.querySelector('.content'); // Scoped search

      if (contentDiv) {
        this.animateIcon(regenBtn);
        const originalContent = contentDiv.textContent.trim();
        const type = regenBtn.dataset.action; // 'summarize' or 'quiz'
        const key = `${actionContainer.dataset.key}`;

        try {
          // Get processed content
          const newContent = await this.processor.processContent(
            originalContent,
            key,
            type
          );

          // Update the content div
          contentDiv.innerHTML = newContent;
          console.log('Content updated and cached successfully.');
        } catch (err) {
          console.error('Failed to regenerate content:', err);
        }
      } else {
        console.warn('No .content element found for regeneration.');
      }
    }
  }

  animateIcon(btn) {
    const svg = btn.querySelector('.button-icon');
    svg.classList.add('active');
    setTimeout(() => {
      svg.classList.remove('active');
    }, 500);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  new ContentManager();
});
