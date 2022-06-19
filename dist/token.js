"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    type;
    lexeme;
    literal;
    line;
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return `${this.type} ${this.lexeme} ${JSON.stringify(this.literal)}`;
    }
}
exports.Token = Token;
