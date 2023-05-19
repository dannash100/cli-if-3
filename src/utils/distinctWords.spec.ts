import { distinctWords } from './distinctWords'

describe('distinctWords', () => {
  it('returns string unchanged if no duplicates', () => {
    console.time('1')
    expect(distinctWords('dog')).toBe('dog')
    console.timeEnd('1')
  })
  it('removes duplicate given a string of two repeated words', () => {
    console.time('2')
    expect(distinctWords('dog dog')).toBe('dog')
    console.timeEnd('2')
  })
  it('removes duplicates separated by multiple whitespace characters', () => {
    console.time('3')
    expect(distinctWords('dog   dog')).toBe('dog')
    console.timeEnd('3')
  })
  it('removes duplicates when a mix of repeated and single words', () => {
    expect(distinctWords('cat cat dog horse horse tiger')).toBe(
      'cat dog horse tiger'
    )
  })
  it('removes triplicates given a string of a word repeated 3 times', () => {
    expect(distinctWords('dog dog dog')).toBe('dog')
  })
  it('removes a varying mix of duplicated words given string with multiple whitespace and non repeated words', () => {
    expect(
      distinctWords(
        'dog   dog dog dog  dog cat dog  dog cat horse horse horse  horse bug'
      )
    ).toBe('dog cat horse bug')
  })
  it('removes repeated words from very long string', () => {
    console.time('5')
    expect(
      distinctWords(
        'big big dog big man man god god man god big dog man hand monkey fish fish bucket ice man big dog monkey ticket bunk bead looper dog monkey fish dog cat'
      )
    ).toBe(
      'god hand bucket ice man big ticket bunk bead looper monkey fish dog cat'
    )
    console.timeEnd('5')
  })
})

console.log(distinctWords('dog dog cat dog'))
