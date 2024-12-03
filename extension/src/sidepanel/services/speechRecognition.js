export class SpeechRecognition {
  constructor(onTranscriptCallback) {
    this.recognition = null;
    this.onTranscriptCallback = onTranscriptCallback;
    this.initRecognition();
  }

  initRecognition() {
    if (!window.webkitSpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition = new webkitSpeechRecognition();
    this.setupRecognitionConfig();
    this.setupRecognitionHandlers();
  }

  setupRecognitionConfig() {
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = true;
  }

  setupRecognitionHandlers() {
    this.recognition.onresult = (event) => {
      let transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map(result => result[0].transcript)
        .join('');

      this.onTranscriptCallback(transcript);
    };

    this.recognition.onend = () => {
      if (this.isActive && !this.isPaused) {
        this.recognition.start();
      }
    };
  }

  start() {
    this.isActive = true;
    this.isPaused = false;
    this.recognition.start();
  }

  stop() {
    this.isActive = false;
    this.recognition.stop();
  }

  pause() {
    this.isPaused = true;
    this.recognition.stop();
  }

  resume() {
    this.isPaused = false;
    this.recognition.start();
  }
}