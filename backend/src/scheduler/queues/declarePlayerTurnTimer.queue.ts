import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import declarePlayerTurnTimerProcess from "../processes/declarePlayerTurnTimer.process";

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

let declarePlayerTurnTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // Implement on Production
} else {
  declarePlayerTurnTimerQueue = new Bull(`declarePlayerTurnTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const declarePlayerTurnTimer = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(
      tableId,
      `---- startDeclarePlayerTurnTimer ::=>> ${JSON.stringify(data)}`
    );

    const options = {
      delay: data.timer,
      jobId: data.jobId,
    };

    Logger.info(tableId, "startDeclarePlayerTurnTimer options: ", options);

    await declarePlayerTurnTimerQueue.add(data, options);
    return declarePlayerTurnTimerQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

declarePlayerTurnTimerQueue.process(declarePlayerTurnTimerProcess);

export default declarePlayerTurnTimer;
