import { RecorderController } from './controllers/recorder.js';

const initializeRecorder = () => {
  try {
    return new RecorderController();
  } catch (error) {
    console.log(error);
  }
};

export default initializeRecorder;