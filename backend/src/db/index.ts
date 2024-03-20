import UserProfileService from "./userProfile/model";
import TableGamePlayService from "./tableGamePlay/model";
import TableConfigurationService from "./tableConfig/model";
import PlayerGamePlayService from "./playerGamePlay/model";

const exportObj = {
  UserProfile: new UserProfileService(),
  TableGamePlay: new TableGamePlayService(),
  TableConfig: new TableConfigurationService(),
  PlayerGamePlay: new PlayerGamePlayService(),
};

export default exportObj;
