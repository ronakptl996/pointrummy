import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const lockTimerStartProcess = (job: any) => {
  try {
    Logger.info(" lockTimerStartProcess :: job is ::", job.data);

    commonEventEmitter.emit(EVENT_EMITTER.LOCK_IN_PERIOD_EXPIRED, job.data);

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default lockTimerStartProcess;
