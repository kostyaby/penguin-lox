"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSink = void 0;
class ErrorSink {
    hadError = false;
    error(line, message) {
        this.report(line, "", message);
    }
    report(line, where, message) {
        console.error(`[line ${line}] Error${where}: ${message}`);
        this.hadError = true;
    }
}
exports.ErrorSink = ErrorSink;
