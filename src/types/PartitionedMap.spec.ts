import { PartitionedMap } from './PartitionedMap'

describe('PartitionedMap', () => {
  it('should initialize with base map', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const map = new PartitionedMap(base, [])
    expect(map.get('a')).toEqual([1, 2, 3])
  })
  it('should initialize with partitions', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: false,
        active: true,
        value: new Map([['a', [4, 5, 6]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    expect(map.get('a')).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('should update partitions', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: false,
        active: false,
        value: new Map([['a', [4, 5, 6]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    expect(map.get('a')).toEqual([1, 2, 3])
    map.setActive('b', true)
    expect(map.get('a')).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('should use cached value', () => {
    const partitionSpy = jest.spyOn(PartitionedMap.prototype, 'partition')
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: false,
        active: true,
        value: new Map([['a', [4, 5, 6]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    map.setActive('b', false)
    map.setActive('b', true)
    map.setActive('b', false)
    expect(partitionSpy).toHaveBeenCalledTimes(2)
  })
  it('should work with multiple partitions', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: false,
        active: true,
        value: new Map([['a', [4, 5, 6]]]),
      },
      {
        id: 'c',
        isolated: false,
        active: true,
        value: new Map([['a', [7, 8, 9]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    expect(map.get('a')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
  it('should return keys of multiple partitions', () => {
    const base = new Map([['a', []]])
    const partitions = [
      { id: 'b', isolated: false, active: true, value: new Map([['b', []]]) },
      { id: 'c', isolated: false, active: true, value: new Map([['a', []]]) },
      { id: 'd', isolated: false, active: true, value: new Map([['c', []]]) },
    ]
    const map = new PartitionedMap(base, partitions)
    expect([...map.keys()]).toEqual(['a', 'b', 'c'])
  })
  it('should initialize with isolated partition', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: true,
        active: true,
        value: new Map([['a', [4, 5, 6]]]),
      },
      {
        id: 'c',
        isolated: false,
        active: true,
        value: new Map([['a', [7, 8, 9]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    expect(map.get('a')).toEqual([4, 5, 6])
  })
  it('should isolate partition', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: false,
        active: true,
        value: new Map([['a', [4, 5, 6]]]),
      },
      {
        id: 'c',
        isolated: false,
        active: true,
        value: new Map([['a', [7, 8, 9]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    map.isolate('c')
    expect(map.get('a')).toEqual([7, 8, 9])
  })
  it('should unisolate partition', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      {
        id: 'b',
        isolated: true,
        active: true,
        value: new Map([['a', [4, 5, 6]]]),
      },
      {
        id: 'c',
        isolated: false,
        active: true,
        value: new Map([['a', [7, 8, 9]]]),
      },
    ]
    const map = new PartitionedMap(base, partitions)
    map.unisolate()
    expect(map.get('a')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
