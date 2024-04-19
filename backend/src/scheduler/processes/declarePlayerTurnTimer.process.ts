import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { EVENT_EMITTER } from "../../constants";

const declarePlayerTurnTimerProcess = (job: any) => {
  try {
    Logger.info(" daclarePlayerTurnTimerProcess :: job is ::", job.data);

    commonEventEmitter.emit(
      EVENT_EMITTER.DACLARE_PLAYER_TURN_TIMER_EXPIRED,
      job.data
    );

    return job.data;
  } catch (error) {
    Logger.error(error);
    return undefined;
  }
};

export default declarePlayerTurnTimerProcess;
