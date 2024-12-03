import { SVG_ICONS } from '../../shared/constants.js';

export class TranscriptionUI {
  constructor(container) {
    this.container = container;
    this.currentTranscriptionDiv = null;
    this.currentContainer = null;
  }

  createNew() {
    if (this.currentContainer) {
      this.currentContainer.classList.remove('active');
      this.currentContainer.classList.add('inactive');
    }

    const { container, content } = this.createTranscriptionElements();
    this.container.appendChild(container);
    container.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    this.currentContainer = container;
    this.currentTranscriptionDiv = content;

    return content;
  }

  createTranscriptionElements() {
    const container = document.createElement('div');
    container.className = 'transcription active';
    const uniqueKey = Date.now(); // unique key
    container.setAttribute('data-key', uniqueKey); // set key to data-key attribute

    const content = document.createElement('div');
    content.className = 'transcription-content';

    const status = document.createElement('div');
    status.className = 'status';

    const buttonContainer = this.createActionButtons();

    container.appendChild(content);
    container.appendChild(status);
    container.appendChild(buttonContainer);

    return { container, content, key: uniqueKey }; // return key
  }

  createActionButtons() {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = 'button-container';

    const buttons = [
      { svg: this.getSvgIcon('list'), action: 'summarize', tooltip: 'Summarize' },
      { svg: this.getSvgIcon('translate'), action: 'translate', tooltip: 'Translate' },
      { svg: this.getSvgIcon('pencil'), action: 'quiz', tooltip: 'Quiz' }
    ];

    buttons.forEach(({ svg, action, tooltip }) => {
      const buttonWrapper = document.createElement("div");
      buttonWrapper.classList.add("control-button-outer");

      const tooltipDiv = document.createElement("div");
      tooltipDiv.classList.add("tooltip");
      tooltipDiv.textContent = tooltip;

      const button = document.createElement("button");
      button.classList.add("action-btn");
      button.setAttribute("data-action", action);
      button.innerHTML = `
            <div class="button-inner control-btn" data-action="${action}">
                ${svg}
            </div>
        `;

      buttonWrapper.appendChild(tooltipDiv);
      buttonWrapper.appendChild(button);

      buttonContainer.appendChild(buttonWrapper);
    });

    return buttonContainer;
  }

  getSvgIcon(type) {
    const icons = SVG_ICONS;
    return icons[type] || '';
  }

  updateStatus(status) {
    if (!this.currentContainer) return;

    this.currentContainer.classList.remove('recording', 'paused', 'stopped');
    this.currentContainer.classList.add(status);

    const statusIndicator = this.currentContainer.querySelector('.status');
    if (statusIndicator) {
      statusIndicator.textContent = status === 'paused' ? 'PAUSED' : '';
    }
  }

  stopRecording() {
    const allTranscriptions = document.querySelectorAll('.transcription');
    allTranscriptions.forEach(div => {
      div.classList.remove('active', 'inactive', 'paused', 'recording');
      div.classList.add('stopped');

      // clear status wording
      const statusIndicator = div.querySelector('.status');
      if (statusIndicator) {
        statusIndicator.textContent = '';
      }
    });
  }

  clear() {
    this.container.innerHTML = '';
    this.currentTranscriptionDiv = null;
    this.currentContainer = null;
    document.querySelector('.title-input').value = '';
  }
}