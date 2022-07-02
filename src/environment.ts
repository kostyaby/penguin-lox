import { Token } from "./token";
import { RuntimeError } from "./runtime_error";

export class Environment {
  private readonly values = new Map<string, any>();

  constructor(private readonly enclosing?: Environment) {}

  define(name: string, value: any): void {
    if (value === undefined) {
      throw new Error("Values must not be `undefined`!");
    }

    this.values.set(name, value);
  }

  assign(name: Token, value: any): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    } else if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  get(name: Token): any {
    // Assumtion: no valud values should `undefined.`
    const value = this.values.get(name.lexeme);
    if (value !== undefined) {
      return value;
    } else if (this.enclosing) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
