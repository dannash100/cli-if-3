import { MatchableGroup, MatchableGroupPaths } from './MatchableGroup'
import { MatchType, Matcher } from './Matcher'
import { DirectionalAdverbs } from './words/DirectionalAdverbs'

describe('Matcher', () => {
  const matchableGroup = new MatchableGroupPaths([
    {
      id: 'blah',
      direction: DirectionalAdverbs.Down,
    },
  ])
  console.log(matchableGroup)
  describe('match', () => {
    it('returns false when no noun match', () => {
      const matcher = new Matcher({ noun: 'key' })
      expect(matcher.match('sword')).toBe(false)
    })
    it('returns false when noun match is not at end of input', () => {
      const matcher = new Matcher({ noun: 'key' })
      expect(matcher.match('key code')).toBe(false)
    })
    it('returns false when matching adjectives but no noun match', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['red'] })
      expect(matcher.match('red ribbon')).toBe(false)
    })
    it('returns exact for a noun with no adjectives', () => {
      const matcher = new Matcher({ noun: 'key' })
      expect(matcher.match('key')).toBe(MatchType.Exact)
    })
    it('returns exact for exactly matches adjectives', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty red key')).toBe(MatchType.Exact)
    })
    it('returns exact for exactly matches adjectives with extra white space', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty  red key ')).toBe(MatchType.Exact)
    })
    it('returns exact when duplicate adjective', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty rusty red key key')).toBe(MatchType.Exact)
    })
    it('returns partial for one root matched with no matched adjectives', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['red'] })
      expect(matcher.match('key')).toBe(MatchType.Partial)
    })
    it('returns partial for one of two adjectives matched', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty key')).toBe(MatchType.Partial)
    })
    it('returns partial when adjectives are duplicated but same length as matchers adjectives', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty rusty key'))
    })
    it('returns misfit given matched noun and misfit adjective', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['red'] })
      expect(matcher.match('blue key')).toBe(MatchType.Misfit)
    })
    it('returns misfit given matched noun and one matching adjective and one misfit adjective', () => {
      const matcher = new Matcher({ noun: 'key', adjectives: ['rusty', 'red'] })
      expect(matcher.match('rusty blue key')).toBe(MatchType.Misfit)
    })
  })
})
