import { Context } from 'vm'
import { Any, If, Predicate } from './conditions'

const predicateN = (i?: number) => (ctx: Context) =>
  ctx[`testContextKey${i || ''}`]
const actionsN = (i: number = 0) => [`action-${i}-1`, `action-${i}-2`]

describe('conditions', () => {
  describe('If', () => {
    it('should return actions if predicate is true', () => {
      const result = If(predicateN(), actionsN()).condition({
        testContextKey: true,
      })
      expect(result).toEqual(actionsN())
    })
    it('should return empty array if predicate is false', () => {
      const result = If(predicateN(), actionsN()).condition({
        testContextKey: false,
      })
      expect(result).toEqual([])
    })
    it('should return else actions if predicate is false with else case defined', () => {
      const result = If(predicateN(), actionsN())
        .else(actionsN(1))
        .condition({ testContextKey: false })
      expect(result).toEqual(actionsN(1))
    })
    it('should return elseif actions if elseif predicate is true', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .condition({ testContextKey1: true })
      expect(result).toEqual(actionsN(1))
    })
    it('should return 2nd chained elseif actions if predicate is true', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .condition({ testContextKey2: true })
      expect(result).toEqual(actionsN(2))
    })
    it('should return 3rd chained elseif actions if its predicate is true', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .condition({ testContextKey3: true })
      expect(result).toEqual(actionsN(3))
    })
    it('should return else actions if no predicates including elseif are true', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .else(actionsN(2))
        .condition({ testContextKey2: false })
      expect(result).toEqual(actionsN(2))
    })
    it('should return 1st of three elseif if its predicate is true', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .condition({ testContextKey1: true })
      expect(result).toEqual(actionsN(1))
    })
    it("should return the first true elseif when multiple true elseif's", () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .condition({ testContextKey2: true, testContextKey1: true })
      expect(result).toEqual(actionsN(1))
    })
    it("should return if actions when its predicate is true followed by multiple elseif's all of which are false", () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .else(actionsN(4))
        .condition({ testContextKey: true })
      expect(result).toEqual(actionsN())
    })
    it('should return if actions if all three elseif are false with no else', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .elseIf(predicateN(4), actionsN(4))
        .condition({ testContextKey: true })
      expect(result).toEqual(actionsN())
    })
    it('should return 2nd and only true elseif in a chain of three and an else condition', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .else(actionsN(4))
        .condition({ testContextKey2: true })
      expect(result).toEqual(actionsN(2))
    })
    it('should return 2nd and only true elseif in a chain of three with no else condition', () => {
      const result = If(predicateN(), actionsN())
        .elseIf(predicateN(1), actionsN(1))
        .elseIf(predicateN(2), actionsN(2))
        .elseIf(predicateN(3), actionsN(3))
        .condition({ testContextKey2: true })
      expect(result).toEqual(actionsN(2))
    })
  })
  // describe('Predicate', () => {
  //   it('should return true if predicate is true', () => {
  //     const condition = Predicate(predicateN()).end()
  //     const result = condition({ testContextKey: true })
  //     expect(result).toEqual(true)
  //   })
  //   it('should return false if predicate is false', () => {
  //     const condition = Predicate(predicateN()).end()
  //     const result = condition({ testContextKey: false })
  //     expect(result).toEqual(false)
  //   })

  //   it('should return true with chained and if both predicates are true', () => {
  //     const condition = Predicate(predicateN())
  //       .and(predicateN(1))
  //     .end()
  //     const result = condition({ testContextKey: true, testContextKey1: true })
  //     expect(result).toEqual(true)
  //   })
  //   it('should return false with chained and if first predicate is false', () => {
  //     const condition = Predicate(predicateN())
  //       .and(predicateN(1)).end()

  //     const result = condition({ testContextKey: false, testContextKey1: true })
  //     expect(result).toEqual(false)
  //   })
  //   it('should return false with chained and if second predicate is false', () => {
  //     const condition = Predicate(predicateN())
  //       .and(predicateN(1)).end()

  //     const result = condition({ testContextKey: true, testContextKey1: false })
  //     expect(result).toEqual(false)
  //   })
  //   it('should return false with chained and if first predicate is false', () => {
  //     const condition = Predicate(predicateN())
  //       .and(predicateN(1))
  //       .end()
  //     const result = condition({ testContextKey: false, testContextKey1: true })
  //     expect(result).toEqual(false)
  //   })
  //   it('should return false with chained and if both predicates are false', () => {
  //     const condition = Predicate(predicateN())
  //       .and(predicateN(1))
  //       .end()
  //     const result = condition({ testContextKey: false, testContextKey1: false })
  //     expect(result).toEqual(false)
  //   })
  //   it('should return true with two chained ands if all predicates are true', () => {
  //     const condition = Predicate(predicateN())
  //       .and(predicateN(1))
  //       .and(predicateN(2))
  //       .end()
  //     const result = condition({ testContextKey: true, testContextKey1: true, testContextKey2: true })
  //     expect(result).toEqual(true)
  //   });
  //   it('should return true with chained or if either predicate is true', () => {
  //     const condition = Predicate(predicateN())
  //       .or(predicateN(1))
  //       .end()
  //     const result = condition({ testContextKey: true, testContextKey1: false })
  //     expect(result).toEqual(true)
  //   })
  //   it('should return false with chained or if both predicates are false', () => {
  //     const condition = Predicate(predicateN())
  //       .or(predicateN(1))
  //       .end()
  //     const result = condition({ testContextKey: false, testContextKey1: false })
  //     expect(result).toEqual(false)
  //   })
  //   it('should return true with two chained ors if either predicate is true', () => {
  //     const condition = Predicate(predicateN())
  //       .or(predicateN(1))
  //       .or(predicateN(2))
  //       .end()
  //     const result = condition({ testContextKey: false, testContextKey1: false, testContextKey2: true })
  //     expect(result).toEqual(true)
  //   })
  //   it('should return false with two chained ors if both predicates are false', () => {
  //     const condition = Predicate(predicateN())
  //       .or(predicateN(1))
  //       .or(predicateN(2))
  //       .end()
  //     const result = condition({ testContextKey: false, testContextKey1: false, testContextKey2: false })
  //     expect(result).toEqual(false)
  //   })
  //   it('should return true for with chained and with nested or chain where one is true', () => {
  //     const condition = Predicate(predicateN())
  //       .and(Predicate(predicateN(1)).or(predicateN(2)).end())
  //       .end()
  //     const result = condition({ testContextKey: true, testContextKey1: false, testContextKey2: true })
  //     expect(result).toEqual(true)
  //   });
  //   it('should return false for with chained and with nested or chain where both are false', () => {
  //     const condition = Predicate(predicateN())
  //       .and(Predicate(predicateN(1)).or(predicateN(2)).end())
  //       .end()
  //     const result = condition({ testContextKey: false, testContextKey1: false, testContextKey2: false })
  //     expect(result).toEqual(false)
  //   })
  // })
  describe('Any', () => {
    it('should return true if any predicate is true', () => {
      const condition = Any(predicateN(), predicateN(1))
      const result = condition({ testContextKey: true })
      expect(result).toEqual(true)
    })
    it('should return false if all predicates are false', () => {
      const condition = Any(predicateN(), predicateN(1))
      const result = condition({ testContextKey: false })
      expect(result).toEqual(false)
    })
    it('should return true if one is true and two are false', () => {
      const condition = Any(predicateN(), predicateN(1), predicateN(2))
      const result = condition({ testContextKey1: true })
      expect(result).toEqual(true)
    })
    it('should return false if all are false', () => {
      const condition = Any(predicateN(), predicateN(1), predicateN(2))
      const result = condition({
        testContextKey: false,
        testContextKey1: false,
        testContextKey2: false,
      })
      expect(result).toEqual(false)
    })
    it('should return false if all are false', () => {
      const condition = Any(predicateN(), predicateN(1), predicateN(2))
      const result = condition({
        testContextKey: false,
        testContextKey1: false,
        testContextKey2: false,
      })
      expect(result).toEqual(false)
    })
  })
})
