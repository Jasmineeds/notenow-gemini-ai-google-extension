import { RECORDER_STATES } from '../../shared/constants.js';
import { SpeechRecognition } from '../services/speechRecognition.js';
import { AudioRecording } from '../services/recording.js';
import { Timer } from '../services/time.js';
import { TranscriptionUI } from '../components/transcription.js';
import { AlertDialog } from '../components/alert.js';


export class RecorderController {
  constructor() {
    this.state = RECORDER_STATES.INITIAL;
    this.transcriptionUI = new TranscriptionUI(document.querySelector('.transcription-container'));
    this.audioRecorder = new AudioRecording();
    this.timer = new Timer(this.updateTimerDisplay.bind(this));
    this.speechRecognition = new SpeechRecognition(this.handleTranscript.bind(this));

    this.initializeUI();
    this.bindEvents();
  }

  initializeUI() {
    this.elements = {
      controls: document.querySelector('.controls'),
      lapButton: document.querySelector('[data-action="lap"]'),
      stopButton: document.querySelector('[data-action="stop"]'),
      progressBar: document.querySelector('.progress-bar'),
      timerDisplay: document.querySelector('.progress-timer')
    };

    this.hideProgress();
    this.updateState(RECORDER_STATES.INITIAL);
  }

  bindEvents() {
    this.elements.controls.addEventListener('click', (event) => {
      const button = event.target.closest('.control-btn');
      if (!button) return;

      const action = button.dataset.action;
      if (this[action]) {
        this[action]();
      }
    });
  }

  updateState(newState) {
    this.state = newState;
    this.updateUI();
  }

  updateUI() {
    this.updateProgressBar();
    this.updateControlsVisibility();
  }

  updateProgressBar() {
    this.elements.progressBar.style.backgroundColor =
      (this.state === RECORDER_STATES.RECORDING) ? '#3B82F6' : '#D1D5DB';
  }

  updateControlsVisibility() {
    const stateButtons = {
      [RECORDER_STATES.INITIAL]: ['record'],
      [RECORDER_STATES.RECORDING]: ['lap', 'pause', 'stop'],
      [RECORDER_STATES.PAUSED]: ['lap', 'resume', 'stop'],
      [RECORDER_STATES.STOPPED]: ['delete']
    };

    // Hide all buttons first
    const allButtons = this.elements.controls.querySelectorAll('.control-button-outer');
    allButtons.forEach(btn => btn.classList.add('hidden'));

    // Show/hide record menu
    const recordMenu = document.querySelectorAll(".record-menu");
    recordMenu.forEach(menu => {
      menu.classList.toggle('hidden',
        ![RECORDER_STATES.RECORDING, RECORDER_STATES.PAUSED].includes(this.state)
      );
    });

    // Show relevant buttons for current state
    const buttonsToShow = stateButtons[this.state] || [];
    buttonsToShow.forEach(action => {
      const button = this.elements.controls.querySelector(`[data-action="${action}"]`);
      if (button) {
        button.closest('.control-button-outer').classList.remove('hidden');
      }
    });
  }

  hideProgress() {
    this.elements.progressBar.classList.add('hidden');
    this.elements.timerDisplay.classList.add('hidden');
  }

  showProgress() {
    this.elements.progressBar.classList.remove('hidden');
    this.elements.timerDisplay.classList.remove('hidden');
  }

  updateTimerDisplay(time) {
    this.elements.timerDisplay.textContent = time;
  }

  handleTranscript(transcript) {
    if (this.transcriptionUI.currentTranscriptionDiv) {
      this.transcriptionUI.currentTranscriptionDiv.textContent += transcript;
    }
  }

  // Action Methods
  async record() {
    try {
      // check mic permission
      const hasPermission = await this.audioRecorder.checkPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }
      await this.audioRecorder.startRecording(); // start recording
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      return;
    }

    try {
      this.speechRecognition.start();
      this.transcriptionUI.createNew();
      this.timer.start();
      this.showProgress();
      this.updateState(RECORDER_STATES.RECORDING);
    } catch (error) {
      console.error('Failed to start other components:', error);
    }
  }

  lap() {
    if (this.state !== RECORDER_STATES.RECORDING) return;

    this.transcriptionUI.createNew();
    this.timer.lap();

    this.transcriptionUI.updateStatus('recording');
  }

  pause() {
    if (this.state !== RECORDER_STATES.RECORDING) return;

    this.transcriptionUI.currentTranscriptionDiv.textContent += '. ';
    this.audioRecorder.pauseRecording();
    this.speechRecognition.pause();
    this.timer.pause();
    this.updateState(RECORDER_STATES.PAUSED);
    this.transcriptionUI.updateStatus('paused');
    this.elements.lapButton.classList.add('disabled');
    this.elements.stopButton.classList.add('enabled')
  }

  resume() {
    if (this.state !== RECORDER_STATES.PAUSED) return;

    this.audioRecorder.resumeRecording();
    this.speechRecognition.resume();
    this.timer.start();
    this.updateState(RECORDER_STATES.RECORDING);
    this.transcriptionUI.updateStatus('recording');
    this.elements.lapButton.classList.remove('disabled');
    this.elements.stopButton.classList.remove('enabled');
  }

  stop() {
    this.audioRecorder.stopRecording();
    this.speechRecognition.stop();
    this.timer.pause();
    this.hideProgress();
    this.updateState(RECORDER_STATES.STOPPED);
    this.transcriptionUI.updateStatus('stopped');
    this.transcriptionUI.stopRecording();
    this.elements.lapButton.classList.remove('disabled');
    // query action btn for offscreen
    this.bindActionButtons()
  }

  delete() {
    // onDeleteConfirm
    this.alertDialog = new AlertDialog(this.timer, () => {
      this.transcriptionUI.clear();
      this.timer.reset();
      this.updateState(RECORDER_STATES.INITIAL);
    });

    this.alertDialog.showDeleteAlert();
  }

  // move to offscreen
  bindActionButtons() {
    document.querySelectorAll('.action-btn').forEach(button => {
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });
  }

  handleButtonClick(event) {
    const titleInput = document.querySelector('.title-input');
    let title = titleInput.value.trim();

    const transcriptions = Array.from(document.querySelectorAll('.transcription')).map((div) => {
      const e = event.target
      const key = div.getAttribute('data-key');
      const content = div.querySelector('.transcription-content').textContent.trim();
      const isFocused = div === e.closest('.transcription');

      return {
        key,
        content,
        focused: isFocused, // indicate which btn clicked
        action: isFocused ? e.closest('.action-btn').getAttribute('data-action') : null
      };
    });

    // save to chrome.storage
    // chrome.storage.local.get("transcriptions", (result) => { console.log(result.transcriptions); });
    chrome.storage.local.set({ title, transcriptions }, function () {
      console.log("All transcriptions saved!", { title, transcriptions });
    });

    // open offscreen
    chrome.windows.create({
      url: 'src/offscreen/offscreen.html',
      type: 'popup',
      width: 1200,
      height: 784
    });

    // send arr to offscreen
    chrome.runtime.sendMessage(
      {
        action: "displayTranscripts",
        title,
        transcriptions,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError.message);
        } else {
          console.log("Message acknowledged:", response);
        }
      }
    );
  }
}

const initializeRecorder = new RecorderController();
