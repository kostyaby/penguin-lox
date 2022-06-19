import fs from "node:fs";
import process from "node:process";
import readline from "node:readline";

import { ErrorSink } from "./error_sink";
import { Lexer } from "./lexer";

function run(source: string) {
  const errorSink = new ErrorSink();
  const lexer = new Lexer(errorSink, source);
  const tokens = lexer.scanTokens();

  if (errorSink.hadError) {
    process.exit(65);
  }

  console.log(`Num of tokens: ${tokens.length}`);
  console.log();

  for (const token of tokens) {
    console.log(token.toString());
  }
}

function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.prompt();
  rl.on("line", (sourceLine) => {
    run(sourceLine);
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
  if (process.argv.length < 3 || process.argv.length > 4) {
    console.error("Usage: penguin-lox [path]\n");
    process.exit(64);
  }

  if (process.argv.length === 3) {
    runPrompt();
  } else {
    runFile(process.argv[3]);
  }
}

main();
