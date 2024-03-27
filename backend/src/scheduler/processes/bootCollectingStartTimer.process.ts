import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const bootCollectingStartTimerProcess = (job: any) => {
  try {
    Logger.info(" bootCollectingStartTimerProcess :: job is ::", job.data);

    commonEventEmitter.emit(
      EVENT_EMITTER.BOOT_COLLECTING_START_TIMER_EXPIRED,
      job.data
    );

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default bootCollectingStartTimerProcess;
