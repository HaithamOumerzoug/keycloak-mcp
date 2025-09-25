import chalk from "chalk";

export type LogLevel =
  | "error"
  | "debug"
  | "info"
  | "notice"
  | "warning"
  | "critical"
  | "alert"
  | "emergency";

function formatMessage(
  namespace: string,
  level: LogLevel,
  entity: string,
  message: string
): string {
  const date = new Date().toISOString();
  const pid = process.pid;
  const levelLabel = level.toUpperCase();

  let coloredMessage: string;
  switch (level) {
    case "debug":
      coloredMessage = `${chalk.blue(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.blue(`${levelLabel} [${entity}] - ${message}`)}`;
      break;
    case "info":
      coloredMessage = `${chalk.green(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.green(`${levelLabel} [${entity}] - ${message}`)}`;
      break;
    case "notice":
      coloredMessage = `${chalk.cyan(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.cyan(`${levelLabel} [${entity}] - ${message}`)}`;
      break;
    case "warning":
      coloredMessage = `${chalk.yellow(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.yellow(`${levelLabel} [${entity}] - ${message}`)}`;
      break;
    case "error":
      coloredMessage = `${chalk.red(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.red(`${levelLabel} [${entity}] - ${message}`)}`;
      break;
    case "critical":
      coloredMessage = `${chalk.redBright(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.redBright(
        `${levelLabel} [${entity}] - ${message}`
      )}`;
      break;
    case "alert":
      coloredMessage = `${chalk.magenta(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.magenta(
        `${levelLabel} [${entity}] - ${message}`
      )}`;
      break;
    case "emergency":
      coloredMessage = `${chalk.bgRed.white(
        `[${namespace}] ${pid}`
      )} - ${date} - ${chalk.bgRed.white(
        `${levelLabel} [${entity}] - ${message}`
      )}`;
      break;
    default:
      coloredMessage = `[${namespace}] ${pid} - ${levelLabel} [${entity}] - ${message}`;
  }

  return coloredMessage;
}

export class Logger {
  private static namespace = "Keyclaok MCP Server";
  private entity: string;

  constructor(entity: string) {
    this.entity = entity;
  }

  private log(level: LogLevel, message: string) {
    const formattedMessage = formatMessage(
      Logger.namespace,
      level,
      this.entity,
      message
    );
    console.log(formattedMessage);
  }

  debug(message: string) {
    this.log("debug", message);
  }

  info(message: string) {
    this.log("info", message);
  }

  notice(message: string) {
    this.log("notice", message);
  }

  warning(message: string) {
    this.log("warning", message);
  }

  error(message: string) {
    this.log("error", message);
  }

  critical(message: string) {
    this.log("critical", message);
  }

  alert(message: string) {
    this.log("alert", message);
  }

  emergency(message: string) {
    this.log("emergency", message);
  }
}
