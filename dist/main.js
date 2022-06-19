"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_process_1 = __importDefault(require("node:process"));
const node_readline_1 = __importDefault(require("node:readline"));
const error_sink_1 = require("./error_sink");
const lexer_1 = require("./lexer");
const ast_printer_1 = require("./ast_printer");
const parser_1 = require("./parser");
function run(source) {
    const errorSink = new error_sink_1.ErrorSink();
    const lexer = new lexer_1.Lexer(errorSink, source);
    const tokens = lexer.scanTokens();
    if (errorSink.hadError) {
        node_process_1.default.exit(65);
    }
    const parser = new parser_1.Parser(errorSink, tokens);
    const expression = parser.parse();
    if (errorSink.hadError) {
        node_process_1.default.exit(65);
    }
    console.log(new ast_printer_1.AstPrinter().print(expression));
}
function runPrompt() {
    const rl = node_readline_1.default.createInterface({
        input: node_process_1.default.stdin,
        output: node_process_1.default.stdout,
    });
    rl.prompt();
    rl.on("line", (sourceLine) => {
        run(sourceLine);
        rl.prompt();
    }).on("close", () => {
        node_process_1.default.exit(0);
    });
}
function runFile(sourcePath) {
    node_fs_1.default.readFile(sourcePath, (err, data) => {
        if (err) {
            throw err;
        }
        // The input string must be UTF-8.
        run(data.toString("utf-8"));
    });
}
function main() {
    if (node_process_1.default.argv.length < 3 || node_process_1.default.argv.length > 4) {
        console.error("Usage: penguin-lox [path]\n");
        node_process_1.default.exit(64);
    }
    if (node_process_1.default.argv.length === 3) {
        runPrompt();
    }
    else {
        runFile(node_process_1.default.argv[3]);
    }
}
main();
