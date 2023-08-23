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

  #merge(partition: Partition): void {
    if (!partition.active) return
    partition.value.forEach((value, key) => {
      const existing = this.value.get(key) || []
      this.value.set(key, [...existing, ...value])
    })
  }

  partition(): void {
    this.set(this.cacheKey, new Map())
    Object.values(this.partitions).forEach((partition) =>
      this.#merge(partition)
    )
  }

  get(key: string): PartitionValue {
    return this.value.get(key) || []
  }
}
