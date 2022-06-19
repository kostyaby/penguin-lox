import { Token, TokenType } from "./token";

export class ErrorSink {
  hadError: boolean = false;

  error(lineOrToken: number | Token, message: string): void {
    if (typeof lineOrToken === "number") {
      this.errorLine(lineOrToken as number, message);
    } else {
      this.errorToken(lineOrToken as Token, message);
    }
  }

  report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }

  private errorLine(line: number, message: string): void {
    this.report(line, "", message);
  }

  private errorToken(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }
}
