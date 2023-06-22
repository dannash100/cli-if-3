import { PartitionedMap } from './PartitionedMap'

describe.skip('PartitionedMap', () => {
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
    console.log('base', partitionedMap, partitionedMap.cacheKey)
    expect(partitionedMap.cacheKey).toEqual('active')
    expect([...partitionedMap.entries()]).toEqual([
      ['base-a', [{ id: 1 }]],
      ['base-b', [{ id: 2 }]],
      ['active-a', [{ id: 3 }]],
      ['active-b', [{ id: 4 }]],
    ])
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
    expect(partitionedMap).toEqual(
      new Map<string, any>([
        ['base-a', [{ id: 1 }, { id: 3 }]],
        ['base-b', [{ id: 2 }]],
        ['active-b', [{ id: 4 }]],
      ])
    )
  })
  it('should merge partition to value when merge method is called with an inactive partition id', () => {
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
    partitionedMap.merge('inactive')
    expect(partitionedMap.cacheKey).toEqual('active-inactive')
    expect(partitionedMap).toEqual(
      new Map<string, any>([
        ['base-a', [{ id: 1 }, { id: 3 }]],
        ['base-b', [{ id: 2 }]],
        ['active-b', [{ id: 4 }]],
        ['inactive-a', [{ id: 5 }]],
        ['inactive-b', [{ id: 6 }]],
      ])
    )
  })
  it('should merge partitions with overlap across base and both partitions', () => {
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
          ['base-b', [{ id: 4 }]],
        ]),
      },
      {
        id: 'active2',
        active: false,
        map: new Map<string, any>([
          ['base-a', [{ id: 5 }]],
          ['base-b', [{ id: 6 }]],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    partitionedMap.merge('active2')
    expect(partitionedMap.cacheKey).toEqual('active-active2')
    expect(partitionedMap).toEqual(
      new Map<string, any>([
        ['base-a', [{ id: 1 }, { id: 3 }, { id: 5 }]],
        ['base-b', [{ id: 2 }, { id: 4 }, { id: 6 }]],
      ])
    )
  })
  it('should remove partition to value when remove method is called with an active partition id', () => {
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
        id: 'active2',
        active: true,
        map: new Map<string, any>([
          ['active2-a', [{ id: 5 }]],
          ['active2-b', [{ id: 6 }]],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    partitionedMap.remove('active2')
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
  it('should remove partition when overlapped keys', () => {
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
        id: 'active2',
        active: true,
        map: new Map<string, any>([
          ['base-a', [{ id: 5 }]],
          ['active-b', [{ id: 6 }]],
        ]),
      },
    ]
    const partitionedMap = new PartitionedMap(base, partitions)
    partitionedMap.remove('active2')
    console.log(partitionedMap.keys())
    expect(partitionedMap.cacheKey).toEqual('active')
    expect(partitionedMap).toEqual(
      new Map<string, any>([
        ['base-a', [{ id: 1 }, { id: 3 }]],
        ['base-b', [{ id: 2 }]],
        ['active-b', [{ id: 4 }]],
      ])
    )
  })
})
