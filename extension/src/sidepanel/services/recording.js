import { AudioDatabase } from './audioDatabase.js'


export class AudioRecording {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async checkPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      alert("Microphone access is required for this feature.\n\n" +
        "1. Please go to the right of the address bar, click \"More\".\n" +
        "2. Select Site settings.\n" +
        "3. Enable microphone permission by switching it to Allow.");
      return false;
    }
  }

  async startRecording() {
    let stream = null;

    try {
      // mic permission
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted.");
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      return;
    }

    if (stream) {
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        await AudioDatabase.saveAudioBlob(audioBlob);
      };

      this.mediaRecorder.start();
      console.log("Recording started.");
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
}
