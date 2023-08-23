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
      { id: 'b', active: true, value: new Map([['a', [4, 5, 6]]]) },
    ]
    const map = new PartitionedMap(base, partitions)
    expect(map.get('a')).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('should update partitions', () => {
    const base = new Map([['a', [1, 2, 3]]])
    const partitions = [
      { id: 'b', active: false, value: new Map([['a', [4, 5, 6]]]) },
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
      { id: 'b', active: true, value: new Map([['a', [4, 5, 6]]]) },
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
      { id: 'b', active: true, value: new Map([['a', [4, 5, 6]]]) },
      { id: 'c', active: true, value: new Map([['a', [7, 8, 9]]]) },
    ]
    const map = new PartitionedMap(base, partitions)
    expect(map.get('a')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
