import { ActivityType, Client } from 'discord.js';
import { Affix } from './Affix';

type ActivitiesType = {
  name: string;
  type: ActivityType;
  url?: string;
};

const affix = new Affix('Activity');

export class Activity {
  private _currentStatus: number = 0;
  private _formats = [
    'Playing',
    'Streaming',
    'Listening to',
    'Watching',
    '{emoji}',
    'Competing in',
  ];

  constructor(
    private _client: Client,
    private _activities: ActivitiesType[],
    private _intervalInSeconds: number,
    private _logActivity: boolean = false
  ) {}

  setActivity() {
    this._client.user?.setActivity(this._activities[this._currentStatus]);
    if (this._logActivity)
      affix.logFormatted(
        'success',
        `Status set to "${
          this._formats[this._activities[this._currentStatus].type]
        } ${this._activities[this._currentStatus].name}"`
      );
  }

  nextStatus() {
    this._currentStatus =
      this._currentStatus === this._activities.length - 1
        ? 0
        : this._currentStatus + 1;
    this.setActivity();
  }

  startCycle() {
    setInterval(() => {
      this.nextStatus();
    }, this._intervalInSeconds * 1000);
  }

  get currentStatus() {
    return this._currentStatus;
  }
}
