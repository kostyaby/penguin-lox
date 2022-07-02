import { Token, TokenType } from "./token";
import * as expr from "./expr";
import * as stmt from "./stmt";
import { ErrorSink } from "./error_sink";

export class Parser {
  private current: number = 0;

  constructor(
    private readonly errorSink: ErrorSink,
    private readonly tokens: Token[]
  ) {}

  parse(): stmt.Statement[] {
    const statements: stmt.Statement[] = [];

    while (!this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) {
        statements.push(statement);
      }
    }

    return statements;
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
   * program     -> declaration* EOF                           ;
   *
   * declaration -> varDecl | statement                        ;
   *
   * varDecl     -> "var" IDENTIFIER ( "=" expression )? ";"   ;
   *
   * statement   -> exprStmt | printStmt | block               ;
   * exprStmt    -> expression ";"                             ;
   * printStmt   -> "print" expression ";"                     ;
   * block       -> "{" declaration* "}"                       ;
   *
   * expression  -> assignment                                 ;
   * assignment  -> IDENTIFIER "=" assignment | equality       ;
   * equality    -> comparison ( ( "!=" | "==" ) comparison )* ;
   * comparison  -> term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
   * term        -> factor ( ( "-" | "+" ) factor )*           ;
   * factor      -> unary ( ( "/" | "*" ) unary )*             ;
   * unary       -> ( "!" | "-" ) unary | primary              ;
   * primary     -> NUMBER | STRING | "true" | "false" | "nil"
   *              | "(" expression ")" | IDENTIFIER            ;
   */

  private declaration(): stmt.Statement | undefined {
    try {
      if (this.match(TokenType.VAR)) {
        return this.variableDeclaration();
      }
      return this.statement();
    } catch (err) {
      this.syncronize();
      return;
    }
  }

  private variableDeclaration(): stmt.Statement {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer: expr.Expression | null = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");

    return new stmt.VariableStatement(name, initializer);
  }

  private statement(): stmt.Statement {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return this.blockStatement();
    }

    return this.expressionStatement();
  }

  private printStatement(): stmt.Statement {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");

    return new stmt.PrintStatement(value);
  }

  private blockStatement(): stmt.Statement {
    const statements: stmt.Statement[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) {
        statements.push(statement);
      }
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");

    return new stmt.BlockStatement(statements);
  }

  private expressionStatement(): stmt.Statement {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");

    return new stmt.ExpressionStatement(value);
  }

  private expression(): expr.Expression {
    return this.assignment();
  }

  private assignment(): expr.Expression {
    const expression = this.equality();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expression instanceof expr.VariableExpression) {
        const name = (expression as expr.VariableExpression).name;
        return new expr.AssignmentExpression(name, value);
      }

      this.errorSink.error(equals, "Invalid assignment target.");
    }

    return expression;
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

    if (this.match(TokenType.IDENTIFIER)) {
      return new expr.VariableExpression(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");

      return new expr.GroupingExpression(expression);
    }

    throw this.error(this.peek(), "Expect expression.");
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
