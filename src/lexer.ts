import { ErrorSink } from "./error_sink";
import { Token } from "./token";
import { TokenType } from "./token_type";

const KEYWORDS_MAP = new Map<string, TokenType>()
  .set("and", TokenType.AND)
  .set("class", TokenType.CLASS)
  .set("else", TokenType.ELSE)
  .set("false", TokenType.FALSE)
  .set("for", TokenType.FOR)
  .set("fun", TokenType.FUN)
  .set("if", TokenType.IF)
  .set("nil", TokenType.NIL)
  .set("or", TokenType.OR)
  .set("print", TokenType.PRINT)
  .set("return", TokenType.RETURN)
  .set("super", TokenType.SUPER)
  .set("this", TokenType.THIS)
  .set("true", TokenType.TRUE)
  .set("var", TokenType.VAR)
  .set("while", TokenType.WHILE);

export class Lexer {
  private readonly tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(
    private readonly errorSink: ErrorSink,
    private readonly source: string
  ) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      // We are beginning of the next lexeme.
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      case "(": {
        this.addToken(TokenType.LEFT_PAREN);
        break;
      }

      case ")": {
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      }

      case "{": {
        this.addToken(TokenType.LEFT_BRACE);
        break;
      }

      case "}": {
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      }

      case ",": {
        this.addToken(TokenType.COMMA);
        break;
      }

      case ".": {
        this.addToken(TokenType.DOT);
        break;
      }

      case "-": {
        this.addToken(TokenType.MINUS);
        break;
      }

      case "+": {
        this.addToken(TokenType.PLUS);
        break;
      }

      case ";": {
        this.addToken(TokenType.SEMICOLON);
        break;
      }

      case "*": {
        this.addToken(TokenType.STAR);
        break;
      }

      case "!": {
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      }

      case "=": {
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      }

      case "<": {
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      }

      case ">": {
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      }

      case "/": {
        if (!this.match("/")) {
          this.addToken(TokenType.SLASH);
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
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.errorSink.error(this.line, "Unexpected character!");
        }

        break;
      }
    }
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private isAlphaDigit(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }

    return this.source.charAt(this.current + 1);
  }

  private string(): void {
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

    this.addToken(
      TokenType.STRING,
      this.source.slice(this.start + 1, this.current - 1)
    );
  }

  private number(): void {
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

    this.addToken(
      TokenType.NUMBER,
      Number.parseFloat(this.source.slice(this.start, this.current))
    );
  }

  private identifier(): void {
    while (this.isAlphaDigit(this.peek())) {
      this.advance();
    }

    const text = this.source.slice(this.start, this.current);
    const type = KEYWORDS_MAP.get(text) ?? TokenType.IDENTIFIER;

    this.addToken(type);
  }

  private addToken(type: TokenType, literal?: any): void {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal ?? null, this.line));
  }
}
