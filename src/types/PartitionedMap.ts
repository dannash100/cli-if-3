type Partition = {
  id: string
  active: boolean
  value: Map<string, any[]>
}

type Partitions = {
  [id: string]: Partition
  base: Partition
}

type CacheValue = Map<string, any[]>
type PartitionValue = any[]
export class PartitionedMap extends Map<string, CacheValue | PartitionValue> {
  public partitions: Partitions

  get cacheKey() {
    return Object.keys(this.partitions)
      .filter((key) => this.partitions[key].active)
      .sort()
      .join('-')
  }

  get value() {
    return super.get(this.cacheKey) as CacheValue
  }

  constructor(base: Map<string, any[]>, partitions: Partition[]) {
    super()
    this.partitions = partitions.reduce(
      (acc, partition) => ({
        ...acc,
        [partition.id]: partition,
      }),
      { base: { id: 'base', active: true, value: base } }
    )
    this.partition()
  }

  public setActive(id: string, active: boolean) {
    this.partitions[id].active = active
    if (this.value) return
    this.partition()
  }

  #setInCache(map: CacheValue) {
    super.set(this.cacheKey, map)
  }

  partition(): void {
    const map = new Map()
    Object.values(this.partitions).forEach((partition) => {
      if (partition.active) {
        partition.value.forEach((value, key) => {
          const existing = map.get(key) || []
          map.set(key, [...existing, ...value])
        })
      }
    })
    this.#setInCache(map)
  }

  get(key: string): PartitionValue {
    return this.value.get(key) || []
  }
}
