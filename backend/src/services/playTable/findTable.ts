import Logger from "../../logger";
import { ICreateTable } from "../../interfaces/signup";

const findOrCreateTable = async (signUpData: ICreateTable): Promise<string> => {
  const userId = signUpData.userId;
  const key = `${signUpData.lobbyId}`;
  Logger.info(
    userId,
    `Starting findOrCreateTable for userId : ${signUpData.userId}`
  );

  return "";
};

export default findOrCreateTable;
