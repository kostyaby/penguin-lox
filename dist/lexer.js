"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const token_1 = require("./token");
const token_type_1 = require("./token_type");
const KEYWORDS_MAP = new Map()
    .set("and", token_type_1.TokenType.AND)
    .set("class", token_type_1.TokenType.CLASS)
    .set("else", token_type_1.TokenType.ELSE)
    .set("false", token_type_1.TokenType.FALSE)
    .set("for", token_type_1.TokenType.FOR)
    .set("fun", token_type_1.TokenType.FUN)
    .set("if", token_type_1.TokenType.IF)
    .set("nil", token_type_1.TokenType.NIL)
    .set("or", token_type_1.TokenType.OR)
    .set("print", token_type_1.TokenType.PRINT)
    .set("return", token_type_1.TokenType.RETURN)
    .set("super", token_type_1.TokenType.SUPER)
    .set("this", token_type_1.TokenType.THIS)
    .set("true", token_type_1.TokenType.TRUE)
    .set("var", token_type_1.TokenType.VAR)
    .set("while", token_type_1.TokenType.WHILE);
class Lexer {
    errorSink;
    source;
    tokens = [];
    start = 0;
    current = 0;
    line = 1;
    constructor(errorSink, source) {
        this.errorSink = errorSink;
        this.source = source;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            // We are beginning of the next lexeme.
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new token_1.Token(token_type_1.TokenType.EOF, "", null, this.line));
        return this.tokens;
    }
    scanToken() {
        const c = this.advance();
        switch (c) {
            case "(": {
                this.addToken(token_type_1.TokenType.LEFT_PAREN);
                break;
            }
            case ")": {
                this.addToken(token_type_1.TokenType.RIGHT_PAREN);
                break;
            }
            case "{": {
                this.addToken(token_type_1.TokenType.LEFT_BRACE);
                break;
            }
            case "}": {
                this.addToken(token_type_1.TokenType.RIGHT_BRACE);
                break;
            }
            case ",": {
                this.addToken(token_type_1.TokenType.COMMA);
                break;
            }
            case ".": {
                this.addToken(token_type_1.TokenType.DOT);
                break;
            }
            case "-": {
                this.addToken(token_type_1.TokenType.MINUS);
                break;
            }
            case "+": {
                this.addToken(token_type_1.TokenType.PLUS);
                break;
            }
            case ";": {
                this.addToken(token_type_1.TokenType.SEMICOLON);
                break;
            }
            case "*": {
                this.addToken(token_type_1.TokenType.STAR);
                break;
            }
            case "!": {
                this.addToken(this.match("=") ? token_type_1.TokenType.BANG_EQUAL : token_type_1.TokenType.BANG);
                break;
            }
            case "=": {
                this.addToken(this.match("=") ? token_type_1.TokenType.EQUAL_EQUAL : token_type_1.TokenType.EQUAL);
                break;
            }
            case "<": {
                this.addToken(this.match("=") ? token_type_1.TokenType.LESS_EQUAL : token_type_1.TokenType.LESS);
                break;
            }
            case ">": {
                this.addToken(this.match("=") ? token_type_1.TokenType.GREATER_EQUAL : token_type_1.TokenType.GREATER);
                break;
            }
            case "/": {
                if (!this.match("/")) {
                    this.addToken(token_type_1.TokenType.SLASH);
                    break;
                }
                // A comment goes until the end of the line.
                while (this.peek() !== "\n" && !this.isAtEnd()) {
                    this.advance();
                }
                break;
            }
            case " ":
            case "\r":
            case "\t": {
                // Ignore whitespace.
                break;
            }
            case "\n": {
                this.line++;
                break;
            }
            case '"': {
                this.string();
                break;
            }
            default: {
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    this.errorSink.error(this.line, "Unexpected character!");
                }
                break;
            }
        }
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    isAlpha(c) {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
    }
    isDigit(c) {
        return c >= "0" && c <= "9";
    }
    isAlphaDigit(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
    advance() {
        return this.source[this.current++];
    }
    match(expected) {
        if (this.isAtEnd()) {
            return false;
        }
        if (this.source.charAt(this.current) !== expected) {
            return false;
        }
        this.current++;
        return true;
    }
    peek() {
        if (this.isAtEnd()) {
            return "\0";
        }
        return this.source.charAt(this.current);
    }
    peekNext() {
        if (this.current + 1 >= this.source.length) {
            return "\0";
        }
        return this.source.charAt(this.current + 1);
    }
    string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === "\n") {
                this.line++;
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            this.errorSink.error(this.line, "Unterminated string!");
            return;
        }
        this.advance(); // The closing ".
        this.addToken(token_type_1.TokenType.STRING, this.source.slice(this.start + 1, this.current - 1));
    }
    number() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }
        // Look for a fractional part.
        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            // Consume "."
            this.advance();
            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }
        this.addToken(token_type_1.TokenType.NUMBER, Number.parseFloat(this.source.slice(this.start, this.current)));
    }
    identifier() {
        while (this.isAlphaDigit(this.peek())) {
            this.advance();
        }
        const text = this.source.slice(this.start, this.current);
        const type = KEYWORDS_MAP.get(text) ?? token_type_1.TokenType.IDENTIFIER;
        this.addToken(type);
    }
    addToken(type, literal) {
        const text = this.source.slice(this.start, this.current);
        this.tokens.push(new token_1.Token(type, text, literal ?? null, this.line));
    }
}
exports.Lexer = Lexer;
