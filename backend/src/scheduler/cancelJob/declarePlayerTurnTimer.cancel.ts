import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  REDIS_CONNECTION_URL,
  NODE_ENV,
} = config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let daclarePlayerTurnTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  daclarePlayerTurnTimerQueue = new Bull(`daclarePlayerTurnTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelDeclarePlayerTurnTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelDeclarePlayerTurnTimer ::=>> ${jobId}`);

    const job = await daclarePlayerTurnTimerQueue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelDeclarePlayerTurnTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId, "cancelDeclarePlayerTurnTimer", e);
  }
};

export default cancelDeclarePlayerTurnTimer;
