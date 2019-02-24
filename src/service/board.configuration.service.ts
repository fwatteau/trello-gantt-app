import {Board} from "../model/board";
import {FilterConfiguration} from "../model/filter.configuration";
import {SettingConfiguration} from "../model/setting.configuration";

export class BoardConfigurationService {
  board: Board;
  filter: FilterConfiguration = new FilterConfiguration();
  setting: SettingConfiguration = new SettingConfiguration();

  public isEmpty(): boolean {
    return this.isEmptyFilter()
      && this.isEmptySetting();
  }

  public isEmptyFilter(): boolean {
    return !this.filter.members.length
      && !this.filter.lists.length
      && !this.filter.name;
  }


  public isEmptySetting(): boolean {
    return !this.setting.fieldStartDate
      && !this.setting.fieldEndDate
      // && !this.setting.markerLists.toString()
      && this.setting.duration === 1
      && this.setting.delay === 0;
  }
}