export class AlertDialog {
  constructor(timer, onDeleteConfirm) {
    this.timer = timer;
    this.onDeleteConfirm = onDeleteConfirm;

    this.alertOverlay = document.getElementById('alertOverlay');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.deleteBtn = document.getElementById('deleteBtn');

    this.initAlertEventListeners();
  }

  initAlertEventListeners() {
    this.cancelBtn.addEventListener('click', () => {
      this.hideDeleteAlert();
    });

    this.deleteBtn.addEventListener('click', () => {
      this.hideDeleteAlert();
      if (this.onDeleteConfirm) {
        this.onDeleteConfirm();
      }
    });

    this.alertOverlay.addEventListener('click', (e) => {
      if (e.target === this.alertOverlay) {
        this.hideDeleteAlert();
      }
    });
  }

  showDeleteAlert() {
    this.alertOverlay.style.display = 'flex';
  }

  hideDeleteAlert() {
    this.alertOverlay.style.display = 'none';
  }
}
