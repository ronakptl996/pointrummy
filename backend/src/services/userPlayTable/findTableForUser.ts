import { ICreateTable } from "../../interfaces/signup";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import findOrCreateTable from "../playTable/findTable";

const findTableForUser = async (
  data: ICreateTable,
  userProfile: IUserProfileOutput
) => {
  const tableId = await findOrCreateTable(data);

  console.log("TABLE CREATED ID >> ", tableId);

  try {
  } catch (error) {}
};

export default findTableForUser;
