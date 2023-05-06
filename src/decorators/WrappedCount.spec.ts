import { WrappedCount } from './WrappedCount'

describe('WrappedCount', () => {
  it('should wrap count', () => {
    class TestClass {
      @WrappedCount(10)
      public declare count: number
    }
    const testClass = new TestClass()

    testClass.count = 12
    expect(testClass.count).toBe(2)
  })
})
