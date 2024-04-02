import Logger from "../../logger";
import Bull from "bull";
import config from "../../config";
import { IPlayerTurnTimer } from "../../interfaces/scheduler";
import playerTurnTimerProcess from "../processes/playerTurnTimer.process";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  NODE_ENV,
  REDIS_CONNECTION_URL,
} = config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let playerTurnTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (Implement) for Production
} else {
  playerTurnTimerQueue = new Bull(`playerTurnTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const startPlayerTurnTimer = async (data: IPlayerTurnTimer) => {
  const tableId = data.tableId;
  try {
    Logger.info(
      tableId,
      `---- startPlayerTurnTimer ::=>> ${JSON.stringify(data)}`
    );

    const options = {
      delay: data.timer + 500, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await playerTurnTimerQueue.add(data, options);
    return playerTurnTimerQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

playerTurnTimerQueue.process(playerTurnTimerProcess);

export default startPlayerTurnTimer;
