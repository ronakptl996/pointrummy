import UserProfileService from "./userProfile/model";
import TableGamePlayService from "./tableGamePlay/model";

const exportObj = {
  UserProfile: new UserProfileService(),
  TableGamePlay: new TableGamePlayService(),
};

export default exportObj;
