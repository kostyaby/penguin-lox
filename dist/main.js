"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_process_1 = __importDefault(require("node:process"));
const node_readline_1 = __importDefault(require("node:readline"));
const error_sink_1 = require("./error_sink");
const lexer_1 = require("./lexer");
//
const ast_printer_1 = require("./ast_printer");
const token_1 = require("./token");
const expr = __importStar(require("./expr"));
function run(source) {
    const errorSink = new error_sink_1.ErrorSink();
    const lexer = new lexer_1.Lexer(errorSink, source);
    const tokens = lexer.scanTokens();
    if (errorSink.hadError) {
        node_process_1.default.exit(65);
    }
    console.log(`Num of tokens: ${tokens.length}`);
    console.log();
    for (const token of tokens) {
        console.log(token.toString());
    }
    const expression = new expr.BinaryExpression(new expr.UnaryExpression(new token_1.Token(token_1.TokenType.MINUS, "-", null, 1), new expr.LiteralExpression(123)), new token_1.Token(token_1.TokenType.STAR, "*", null, 1), new expr.GroupingExpression(new expr.LiteralExpression(45.67)));
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
