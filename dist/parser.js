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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("./token");
const expr = __importStar(require("./expr"));
class Parser {
    errorSink;
    tokens;
    current = 0;
    constructor(errorSink, tokens) {
        this.errorSink = errorSink;
        this.tokens = tokens;
    }
    parse() {
        try {
            return this.expression();
        }
        catch (error) {
            return null;
        }
    }
    syncronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === token_1.TokenType.SEMICOLON) {
                return;
            }
            switch (this.peek().type) {
                case token_1.TokenType.CLASS:
                case token_1.TokenType.FOR:
                case token_1.TokenType.FUN:
                case token_1.TokenType.IF:
                case token_1.TokenType.PRINT:
                case token_1.TokenType.RETURN:
                case token_1.TokenType.VAR:
                case token_1.TokenType.WHILE: {
                    return;
                }
            }
            this.advance();
        }
    }
    /**
     * Grammar:
     *
     * expression -> equality                                   ;
     * equality   -> comparison ( ( "!=" | "==" ) comparison )* ;
     * comparison -> term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
     * term       -> factor ( ( "-" | "+" ) factor )*           ;
     * factor     -> unary ( ( "/" | "*" ) unary )*             ;
     * unary      -> ( "!" | "-" ) unary | primary              ;
     * primary    -> NUMBER | STRING | "true" | "false" | "nil"
     *             | "(" expression ")"                         ;
     */
    expression() {
        return this.equality();
    }
    equality() {
        let expression = this.comparison();
        while (this.match(token_1.TokenType.BANG_EQUAL, token_1.TokenType.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expression = new expr.BinaryExpression(expression, operator, right);
        }
        return expression;
    }
    comparison() {
        let expression = this.term();
        while (this.match(token_1.TokenType.GREATER, token_1.TokenType.GREATER_EQUAL, token_1.TokenType.LESS, token_1.TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expression = new expr.BinaryExpression(expression, operator, right);
        }
        return expression;
    }
    term() {
        let expression = this.factor();
        while (this.match(token_1.TokenType.MINUS, token_1.TokenType.PLUS)) {
            const operator = this.previous();
            const right = this.factor();
            expression = new expr.BinaryExpression(expression, operator, right);
        }
        return expression;
    }
    factor() {
        let expression = this.unary();
        while (this.match(token_1.TokenType.SLASH, token_1.TokenType.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expression = new expr.BinaryExpression(expression, operator, right);
        }
        return expression;
    }
    unary() {
        while (this.match(token_1.TokenType.BANG, token_1.TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new expr.UnaryExpression(operator, right);
        }
        return this.primary();
    }
    primary() {
        if (this.match(token_1.TokenType.FALSE)) {
            return new expr.LiteralExpression(false);
        }
        if (this.match(token_1.TokenType.TRUE)) {
            return new expr.LiteralExpression(true);
        }
        if (this.match(token_1.TokenType.NIL)) {
            return new expr.LiteralExpression(null);
        }
        if (this.match(token_1.TokenType.NUMBER, token_1.TokenType.STRING)) {
            return new expr.LiteralExpression(this.previous().literal);
        }
        if (this.match(token_1.TokenType.LEFT_PAREN)) {
            const expression = this.expression();
            this.consume(token_1.TokenType.RIGHT_PAREN, "Expected ')' after expression!");
            return new expr.GroupingExpression(expression);
        }
        throw this.error(this.peek(), "Expected expression.");
    }
    /**
     * Helpers:
     */
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    consume(type, message) {
        if (this.check(type)) {
            return this.advance();
        }
        throw this.error(this.peek(), message);
    }
    check(type) {
        if (this.isAtEnd()) {
            return false;
        }
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === token_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    error(token, message) {
        this.errorSink.error(token, message);
        return new Error();
    }
}
exports.Parser = Parser;
