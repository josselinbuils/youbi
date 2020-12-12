import color from 'ansicolor';
import { ERROR_ACTION } from '../shared/actions';
import { actions } from './actions';

const S_TO_MS = 1e3;
const NS_TO_MS = 1e-6;

enum LogLevel {
  Debug = 'DEBUG',
  Error = 'ERROR',
  Info = 'INFO',
}

type Color = keyof color;

export class Logger {
  private static colors = [
    'blue',
    'magenta',
    'cyan',
    'yellow',
    'lightGray',
    'lightMagenta',
    'lightCyan',
    'lightYellow',
  ] as Color[];
  private static n = 0;

  color: Color;

  private times = {} as { [tag: string]: number };

  static create(tag: string): Logger {
    return new Logger(tag);
  }

  private static getInstanceColor(): Color {
    return this.colors[this.n++];
  }

  private static getLogLevelColor(level: LogLevel): Color {
    switch (level) {
      case LogLevel.Debug:
        return 'lightBlue' as Color;
      case LogLevel.Info:
        return 'green' as Color;
      case LogLevel.Error:
        return 'red' as Color;
      default:
        throw new Error('Unknown level');
    }
  }

  private static now(): number {
    const hrTime = process.hrtime();
    return hrTime[0] * S_TO_MS + hrTime[1] * NS_TO_MS;
  }

  debug(...args: any[]): void {
    this.write(LogLevel.Debug, args);
  }

  info(...args: any[]): void {
    this.write(LogLevel.Info, args);
  }

  error(...args: any[]): void {
    actions.send({
      type: ERROR_ACTION,
      error: args[0] as Error,
    });
    this.write(LogLevel.Error, args);
  }

  time(tag = 'default'): void {
    this.times[tag] = Logger.now();
  }

  timeEnd(tag = 'default'): void {
    const startTime = this.times[tag];

    if (startTime === undefined) {
      throw new Error('Unknown tag');
    }

    delete this.times[tag];
    this.debug(
      `${tag}: ${Math.round((Logger.now() - startTime) * 100) / 100}ms`
    );
  }

  private constructor(private tag: string) {
    this.color = Logger.getInstanceColor();
  }

  private write(level: LogLevel, args: any[]): void {
    const formattedTag = (color[this.color] as (str: string) => string)(
      `[${this.tag}]`
    );
    const formattedLevel = (color[Logger.getLogLevelColor(level)] as (
      str: string
    ) => string)(`[${level}]`);
    args.unshift(formattedTag, formattedLevel);
    console.log.apply(console.log, args);
  }
}
