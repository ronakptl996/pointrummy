import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import { IScoreBoardTimer } from "../../interfaces/scheduler";
import scoreBoardProcess from "../processes/scoreBoard.process";

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

let scoreBoardTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  scoreBoardTimerQueue = new Bull(`StartScoreBoardTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const scoreBoardTimer = async (data: IScoreBoardTimer) => {
  const tableId = data.tableId;
  try {
    Logger.info(
      tableId,
      `--- scoreBoardTimer -- data ::=> ${JSON.stringify(data)}`
    );
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };
    await scoreBoardTimerQueue.add(data, options);
    return scoreBoardTimerQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

scoreBoardTimerQueue.process(scoreBoardProcess);

export default scoreBoardTimer;
