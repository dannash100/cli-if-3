import { PartitionedMap } from './PartitionedMap'

describe('PartitionedMap', () => {
  it('should create a map with base and one active partition with no overlaps', () => {
    const base = new Map<string, any>([
      ['base-a', [{ id: 1 }]],
      ['base-b', [{ id: 2 }]],
    ])
    const partitions = [
      {
        id: 'active',
        active: true,
        map: new Map<string, any>([
          ['active-a', [{ id: 3 }]],
          ['active-b', [{ id: 4 }]],
        ]),
      },
      {
        id: 'inactive',
        active: false,
        map: new Map<string, any>([
          ['inactive-a', [{ id: 5 }]],
          ['inactive-b', [{ id: 6 }]],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    expect(partitionedMap.cacheKey).toEqual('active')
    expect(partitionedMap.value).toEqual(
      new Map<string, any>([
        ['base-a', [{ id: 1 }]],
        ['base-b', [{ id: 2 }]],
        ['active-a', [{ id: 3 }]],
        ['active-b', [{ id: 4 }]],
      ])
    )
  })
  it('should create a map with base and one active partition with overlaps', () => {
    const base = new Map<string, any>([
      ['base-a', [{ id: 1 }]],
      ['base-b', [{ id: 2 }]],
    ])
    const partitions = [
      {
        id: 'active',
        active: true,
        map: new Map<string, any>([
          ['base-a', [{ id: 3 }]],
          ['active-b', [{ id: 4 }]],
        ]),
      },
      {
        id: 'inactive',
        active: false,
        map: new Map<string, any>([
          ['inactive-a', [{ id: 5 }]],
          ['inactive-b', [{ id: 6 }]],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    expect(partitionedMap.cacheKey).toEqual('active')
    expect(partitionedMap.value).toEqual(
      new Map<string, any>([
        ['base-a', [{ id: 1 }, { id: 3 }]],
        ['base-b', [{ id: 2 }]],
        ['active-b', [{ id: 4 }]],
      ])
    )
  })
})
