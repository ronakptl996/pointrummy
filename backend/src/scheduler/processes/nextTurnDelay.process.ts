import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const nextTurnDelayProcess = (job: any) => {
  try {
    commonEventEmitter.emit(EVENT_EMITTER.NEXT_TURN_DELAY, job.data);
    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default nextTurnDelayProcess;
