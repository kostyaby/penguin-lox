import { TokenType } from "./token_type";

export class Token {
  constructor(
    readonly type: TokenType,
    readonly lexeme: string,
    readonly literal: any,
    readonly line: number
  ) {}

  toString(): string {
    return `${this.type} ${this.lexeme} ${JSON.stringify(this.literal)}`;
  }
}
