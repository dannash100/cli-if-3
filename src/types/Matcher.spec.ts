import { MatchType, Matcher } from './Matcher'

describe('Matcher', () => {
  describe('match', () => {
    it('returns false when empty string', () => {
      const matcher = new Matcher({ noun: 'hat', adjectives: ['red'] })
      expect(matcher.match('')).toBe(false)
    })
    it('returns exact for one adjective', () => {
      const matcher = new Matcher({ noun: 'hat', adjectives: ['red'] })
      expect(matcher.match('red')).toBe(MatchType.Exact)
    })
    it('returns exact for exactly matches adjectives', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty red')).toBe(MatchType.Exact)
    })
    it('returns exact for exactly matches adjectives with extra white space', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty  red ')).toBe(MatchType.Exact)
    })
    it('returns exact when duplicate adjective', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty rusty red')).toBe(MatchType.Exact)
    })
    it('returns partial for one of two adjectives matched', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty')).toBe(MatchType.Partial)
    })
    it('returns partial when adjectives are duplicated but same length as matchers adjectives', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty rusty'))
    })
    it('returns misfit given misfit adjective', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['red'] })
      expect(matcher.match('blue')).toBe(MatchType.Misfit)
    })
    it('returns misfit given one matching adjective and one misfit adjective', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty blue')).toBe(MatchType.Misfit)
    })
  })
})
