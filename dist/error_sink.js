"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSink = void 0;
const token_1 = require("./token");
class ErrorSink {
    hadError = false;
    error(lineOrToken, message) {
        if (typeof lineOrToken === "number") {
            this.errorLine(lineOrToken, message);
        }
        else {
            this.errorToken(lineOrToken, message);
        }
    }
    report(line, where, message) {
        console.error(`[line ${line}] Error${where}: ${message}`);
        this.hadError = true;
    }
    errorLine(line, message) {
        this.report(line, "", message);
    }
    errorToken(token, message) {
        if (token.type === token_1.TokenType.EOF) {
            this.report(token.line, " at end", message);
        }
        else {
            this.report(token.line, ` at '${token.lexeme}'`, message);
        }
    }
}
exports.ErrorSink = ErrorSink;
