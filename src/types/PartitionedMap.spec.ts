import { PartitionedMap } from './PartitionedMap'

describe('PartitionedMap', () => {
  it('should create a map with base and one active partition with no overlaps', () => {
    const base = new Map<string, any>([
      ['base-a', 1],
      ['base-b', 2],
    ])
    const partitions = [
      {
        id: 'active',
        active: true,
        map: new Map<string, any>([
          ['active-a', 3],
          ['active-b', 4],
        ]),
      },
      {
        id: 'inactive',
        active: false,
        map: new Map<string, any>([
          ['inactive-a', 5],
          ['inactive-b', 6],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    expect(partitionedMap.cacheKey).toEqual('active')
    expect(partitionedMap.value).toEqual(
      new Map<string, any>([
        ['base-a', 1],
        ['base-b', 2],
        ['active-a', 3],
        ['active-b', 4],
      ])
    )
  })
  it('should create a map with base and one active partition with overlaps', () => {
    const base = new Map<string, any>([
      ['base-a', 1],
      ['base-b', 2],
    ])
    const partitions = [
      {
        id: 'active',
        active: true,
        map: new Map<string, any>([
          ['base-a', 3],
          ['active-b', 4],
        ]),
      },
      {
        id: 'inactive',
        active: false,
        map: new Map<string, any>([
          ['inactive-a', 5],
          ['inactive-b', 6],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    expect(partitionedMap.cacheKey).toEqual('active')
    expect(partitionedMap.value).toEqual(
      new Map<string, any>([
        ['base-a', [1, 3]],
        ['base-b', 2],
        ['active-b', 4],
      ])
    )
  })
})
