export enum TokenType {
  // Single char tokens:
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  SLASH,
  STAR,

  // One or two char tokens:
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals:
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords:
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUN,
  FOR,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,

  EOF,
}

export class Token {
  constructor(
    readonly type: TokenType,
    readonly lexeme: string,
    readonly literal: any,
    readonly line: number
  ) {}

  toString(): string {
    return `${TYPE_NAMES.get(this.type)} ${this.lexeme} ${JSON.stringify(
      this.literal
    )}`;
  }
}

const TYPE_NAMES = new Map<TokenType, string>()
  .set(TokenType.LEFT_PAREN, "LEFT_PAREN")
  .set(TokenType.RIGHT_PAREN, "RIGHT_PAREN")
  .set(TokenType.LEFT_BRACE, "LEFT_BRACE")
  .set(TokenType.RIGHT_BRACE, "RIGHT_BRACE")
  .set(TokenType.COMMA, "COMMA")
  .set(TokenType.DOT, "DOT")
  .set(TokenType.MINUS, "MINUS")
  .set(TokenType.PLUS, "PLUS")
  .set(TokenType.SEMICOLON, "SEMICOLON")
  .set(TokenType.SLASH, "SLASH")
  .set(TokenType.STAR, "STAR")
  .set(TokenType.BANG, "BANG")
  .set(TokenType.BANG_EQUAL, "BANG_EQUAL")
  .set(TokenType.EQUAL, "EQUAL")
  .set(TokenType.EQUAL_EQUAL, "EQUAL_EQUAL")
  .set(TokenType.GREATER, "GREATER")
  .set(TokenType.GREATER_EQUAL, "GREATER_EQUAL")
  .set(TokenType.LESS, "LESS")
  .set(TokenType.LESS_EQUAL, "LESS_EQUAL")
  .set(TokenType.IDENTIFIER, "IDENTIFIER")
  .set(TokenType.STRING, "STRING")
  .set(TokenType.NUMBER, "NUMBER")
  .set(TokenType.AND, "AND")
  .set(TokenType.CLASS, "CLASS")
  .set(TokenType.ELSE, "ELSE")
  .set(TokenType.FALSE, "FALSE")
  .set(TokenType.FUN, "FUN")
  .set(TokenType.FOR, "FOR")
  .set(TokenType.IF, "IF")
  .set(TokenType.NIL, "NIL")
  .set(TokenType.OR, "OR")
  .set(TokenType.PRINT, "PRINT")
  .set(TokenType.RETURN, "RETURN")
  .set(TokenType.SUPER, "SUPER")
  .set(TokenType.THIS, "THIS")
  .set(TokenType.TRUE, "TRUE")
  .set(TokenType.VAR, "VAR")
  .set(TokenType.WHILE, "WHILE")
  .set(TokenType.EOF, "EOF");
