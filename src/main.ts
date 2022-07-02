import fs from "node:fs";
import process from "node:process";
import readline from "node:readline";

import { ArgumentParser } from "argparse";

import { AstPrinter } from "./ast_printer";
import { Environment } from "./environment";
import { ErrorSink } from "./error_sink";
import { Interpreter } from "./interpreter";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

function run(source: string, environment: Environment = new Environment()) {
  const errorSink = new ErrorSink();
  const lexer = new Lexer(errorSink, source);
  const tokens = lexer.scanTokens();

  if (errorSink.hadError) {
    process.exit(65);
  }

  const parser = new Parser(errorSink, tokens);
  const interpreter = new Interpreter(errorSink, environment);

  const statements = parser.parse();
  if (errorSink.hadError) {
    process.exit(65);
  }

  interpreter.interpret(statements);
  if (errorSink.hadRuntimeError) {
    process.exit(70);
  }
}

function runPrompt() {
  const environment = new Environment();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.prompt();
  rl.on("line", (sourceLine) => {
    run(sourceLine, environment);
    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });
}

function runFile(sourcePath: string) {
  fs.readFile(sourcePath, (err, data) => {
    if (err) {
      throw err;
    }

    // The input string must be UTF-8.
    run(data.toString("utf-8"));
  });
}

function main() {
  const argsParser = new ArgumentParser({
    prog: "./penguin-lox",
    description: "Lox interpretator. Penguin edition!",
    add_help: true,
  });

  argsParser.add_argument("path", {
    type: "str",
    nargs: "?",
    help: "a path to a source file",
  });

  const args = argsParser.parse_args(process.argv.slice(2));

  if (args.path === undefined) {
    runPrompt();
  } else {
    runFile(args.path);
  }
}

main();
