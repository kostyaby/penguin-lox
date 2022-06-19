import { Token, TokenType } from "./token";
import * as expr from "./expr";
import { ErrorSink } from "./error_sink";

export class Parser {
  private current: number = 0;

  constructor(
    private readonly errorSink: ErrorSink,
    private readonly tokens: Token[]
  ) {}

  parse(): expr.Expression | null {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }

  private syncronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) {
        return;
      }

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FOR:
        case TokenType.FUN:
        case TokenType.IF:
        case TokenType.PRINT:
        case TokenType.RETURN:
        case TokenType.VAR:
        case TokenType.WHILE: {
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

  private expression(): expr.Expression {
    return this.equality();
  }

  private equality(): expr.Expression {
    let expression = this.comparison();
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expression = new expr.BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private comparison(): expr.Expression {
    let expression = this.term();
    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expression = new expr.BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private term(): expr.Expression {
    let expression = this.factor();
    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expression = new expr.BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private factor(): expr.Expression {
    let expression = this.unary();
    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expression = new expr.BinaryExpression(expression, operator, right);
    }

    return expression;
  }

  private unary(): expr.Expression {
    while (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new expr.UnaryExpression(operator, right);
    }

    return this.primary();
  }

  private primary(): expr.Expression {
    if (this.match(TokenType.FALSE)) {
      return new expr.LiteralExpression(false);
    }

    if (this.match(TokenType.TRUE)) {
      return new expr.LiteralExpression(true);
    }

    if (this.match(TokenType.NIL)) {
      return new expr.LiteralExpression(null);
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new expr.LiteralExpression(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression!");

      return new expr.GroupingExpression(expression);
    }

    throw this.error(this.peek(), "Expected expression.");
  }

  /**
   * Helpers:
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) {
      return this.advance();
    }

    throw this.error(this.peek(), message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }

    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string) {
    this.errorSink.error(token, message);
    return new Error();
  }
}
