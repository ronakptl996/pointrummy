import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import url from "url";

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
  // (IMPLEMENT) for production
} else {
  playerTurnTimerQueue = new Bull(`playerTurnTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelPlayerTurnTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelPlayerTurnTimer ::=>> ${jobId}`);
    const job = await playerTurnTimerQueue.getJob(jobId);
    // Logger.info("<<====job=====>>", job);

    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelPlayerTurnTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId, "cancelPlayerTurnTimer", e);
  }
};

export default cancelPlayerTurnTimer;
