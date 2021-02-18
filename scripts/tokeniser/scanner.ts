import TokenType from '../tokenType'
import Token from './token'

class Scanner {
  source: string
  tokens: Token[] = []

  start = 0
  current = 0
  line = 1

  constructor(source: string) {
    this.source = source
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line))
    return this.tokens
  }

  scanToken() {
    const c = this.advance()

    switch (c) {
      case '^':
        this.addToken(TokenType.SEPARATOR)
        break

      case '|':
        this.addToken(
          this.match('|') ? TokenType.DOMAIN_ANCHOR : TokenType.ANCHOR
        )
        break

      case '$':
        this.addToken(TokenType.OPTION_SEPARATOR)
        break

      case ',':
        this.addToken(TokenType.COMMA)
        break

      case '=':
        this.addToken(TokenType.EQUALS)
        break

      case '@':
        if (this.match('@')) {
          this.addToken(TokenType.EXEMPTION)
        } else {
          throw new Error(
            this.line + ': The token @ is not recognized as a single token'
          )
        }

        break

      case '!':
        while (this.peek() != '\n' && !this.isAtEnd()) this.advance()
        break

      case '~':
        this.addToken(TokenType.EXCLUDE)
        break

      case '#':
        const nextChar = this.advance()

        if (nextChar === '#') {
          this.addToken(TokenType.CSS_SEPARATOR)
        } else if (nextChar === '@') {
          if (this.match('#')) this.addToken(TokenType.EXEMPT_CSS_SEPARATOR)
          else throw new Error(`${this.line}: Unknown token here, expected '#'`)
        } else if (nextChar === '?') {
          if (this.match('#')) this.addToken(TokenType.HIDING_CSS_SEPARATOR)
          else throw new Error(`${this.line}: Unknown token here, expected '#'`)
        }
        break

      default:
        console.error(`${this.line}: Unexpected character ${c}`)
        break
    }
  }

  advance(): string {
    this.current++
    return this.source.charAt(this.current - 1)
  }

  match(expected: string): boolean {
    if (expected.length !== 1)
      throw new Error(`'${expected}' isn't of length 1`)
    if (this.isAtEnd()) return false
    if (this.source.charAt(this.current) != expected) return false

    this.current++
    return true
  }

  peek() {
    if (this.isAtEnd()) return '\0'
    return this.source.charAt(this.current)
  }

  addToken(type: TokenType, literal: Object = null) {
    const text = this.source.substr(this.start, this.current)
    this.tokens.push(new Token(type, text, literal, this.line))
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length
  }
}

export default Scanner
