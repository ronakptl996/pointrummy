import UserProfileService from "./userProfile/model";
import TableGamePlayService from "./tableGamePlay/model";
import TableConfigurationService from "./tableConfig/model";

const exportObj = {
  UserProfile: new UserProfileService(),
  TableGamePlay: new TableGamePlayService(),
  TableConfig: new TableConfigurationService(),
};

export default exportObj;
