import { Token, TokenType } from "./token";
import { RuntimeError } from "./runtime_error";

export class ErrorSink {
  hadError: boolean = false;
  hadRuntimeError: boolean = false;

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

  runtimeError(error: RuntimeError) {
    console.error(`${error.message}\n[line ${error.token.line}]`);
    this.hadRuntimeError = true;
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
