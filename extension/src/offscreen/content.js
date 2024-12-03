import { GeminiService } from '../api/gemini.js';

export class ContentProcessor {
  constructor() {
    this.cache = new Map();
    /* 
    cache structure：
    Map {
      'content-key-1' => {
        translate: Map { 
          'zh-TW' => 'translate result 1',
          'ja' => 'translate result 2'
        },
        summarize: 'summary result',
        quiz: 'quiz result'
      },
      'content-key-2' => {
        translate: Map(...),
        summarize: '...',
        quiz: '...'
      }
    }
    */
  }

  async processContent(content, key, type) {
    try {
      // Initialize cache for the content key if it doesn't exist
      if (!this.cache.has(key)) {
        this.cache.set(key, {
          translate: new Map(),
          summarize: null,
          quiz: null,
          originalContent: content, // Save original content
        });
      }

      const contentCache = this.cache.get(key);

      // Reset cache if the content changes
      if (contentCache.originalContent !== content) {
        contentCache.translate = new Map();
        contentCache.summarize = null;
        contentCache.quiz = null;
        contentCache.originalContent = content;
      }

      let processedContent;
      const panel = document.getElementById(`${type}-panel`);

      // Set the data-key attribute on the panel
      if (panel) {
        panel.setAttribute('data-key', key);
      }

      switch (type) {
        case 'translate':
          // For translate, we just show the original text initially
          processedContent = this.showOriginalText(content, key);
          this.defaultTrans()
          break;
        case 'summarize':
          if (!contentCache.summarize) {
            contentCache.summarize = await this.summarizeContent(content);
          }
          processedContent = contentCache.summarize;
          break;
        case 'quiz':
          if (!contentCache.quiz) {
            contentCache.quiz = await this.generateQuiz(content);
          }
          processedContent = contentCache.quiz;
          break;
        default:
          throw new Error(`Invalid processing type: ${type}`);
      }

      return processedContent; // Return processed content
    } catch (error) {
      console.error('Processing error:', error);
      return null;
    }
  }

  showOriginalText(content, key) {
    return `
      <div class="translate-container" data-content-key="${key}">
        <h3 class="original-language-label">English</h3>
        <div class="original-text">${content}</div>
      </div>
    `;
  }

  defaultTrans() {
    const textEl = document.querySelector('.translated-text');
    const selectEl = document.querySelector('.language-select');

    textEl.innerText = "Please select a target language.";
    selectEl.selectedIndex = 0;
  }

  async translateContent(text, key, targetLanguage) {
    const contentCache = this.cache.get(key);
    if (!contentCache) return null;

    // check cache
    if (contentCache.translate.has(targetLanguage)) {
      return contentCache.translate.get(targetLanguage);
    }

    const languagePrompts = {
      'zh-TW': '繁體中文',
      'zh-CN': '簡體中文',
      'ja': '日文',
      'es': '西班牙文'
    };

    const prompt = `Translate the following text to ${languagePrompts[targetLanguage]}: ${text}`;
    const translation = await GeminiService.callApi(prompt);

    // save to cache
    contentCache.translate.set(targetLanguage, translation);
    return translation;
  }

  async summarizeContent(text) {
    const prompt = `Summarize the following text concisely: ${text}`;
    return await GeminiService.callApi(prompt);
  }

  async generateQuiz(text) {
    const prompt = `Create a multiple-choice quiz with 3-4 questions with question numbers as digits and answer options (radio button) using a, b, c, etc. based on this text and add the answer to the end. Don't include the Quiz title. Only make the question part bold. It should be format to container.innertext (e.g. <strong> for bold and <br> for line breaks). Avoid including html in the beginning and the end. Leave one line space between questions and answer key. Here's the text: ${text}`;
    return await GeminiService.callApi(prompt);
  }

  renderContent(type, content) {
    const containerSelector = `.${type}-content`;
    const container = document.querySelector(containerSelector);

    if (container) {
      container.innerHTML = content;
      container.classList.add('active');
    }
  }

  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
