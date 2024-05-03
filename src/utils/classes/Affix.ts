type StatusType = 'loading' | 'success' | 'info' | 'warning' | 'error';

export class Affix {
  private _loading = '⧗';
  private _success = '✔';
  private _info = 'ℹ';
  private _warning = '⚠';
  private _error = '✘';

  constructor(private source: string) {}

  getPrefix(status: StatusType) {
    const icons = {
      loading: '\x1b[33m' + this._loading,
      success: '\x1b[32m' + this._success,
      info: '\x1b[33m' + this._info,
      warning: '\x1b[33m' + this._warning,
      error: '\x1b[31m' + this._error,
    };
    return `${icons[status]}\x1b[0m`;
  }

  getSuffix() {
    const date = new Date();
    const time =
      date.toLocaleTimeString('en-US', {
        hourCycle: 'h23',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) +
      '.' +
      ('00' + date.getMilliseconds()).slice(-3);
    return `\x1b[2m[${this.source}] ${time}\x1b[0m`;
  }

  getFormatted(status: StatusType, message: string) {
    return `${this.getPrefix(status)} ${message} ${this.getSuffix()}`;
  }

  logFormatted(status: StatusType, message: string) {
    console.log(this.getFormatted(status, message));
  }
}
