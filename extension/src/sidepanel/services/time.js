export class Timer {
  constructor(onTick) {
    this.time = 0;
    this.interval = null;
    this.onTick = onTick;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  start() {
    this.interval = setInterval(() => {
      this.time++;
      this.onTick(this.formatTime(this.time));
    }, 1000);
  }

  pause() {
    clearInterval(this.interval);
    this.interval = null;
  }

  reset() {
    this.time = 0;
    this.pause();
    this.onTick(this.formatTime(0));
  }

  lap() {
    this.time = 0;
    this.onTick(this.formatTime(0));
  }
}