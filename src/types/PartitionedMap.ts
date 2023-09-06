type PartitionValue = any[]
type Partition = {
  id: string
  active: boolean
  value: Map<string, PartitionValue>
}

type CacheValue = Map<string, PartitionValue>

export class PartitionedMap extends Map<string, CacheValue | PartitionValue> {
  #partitions: Partition[]

  get #cacheKey() {
    return this.#partitions
      .filter((partition) => partition.active)
      .map((partition) => partition.id)
      .sort()
      .join('-')
  }

  get #value() {
    return super.get(this.#cacheKey) as CacheValue
  }

  constructor(base: CacheValue, partitions: Partition[]) {
    super()
    this.#partitions = [
      { id: 'base', active: true, value: base },
      ...partitions,
    ]
    this.partition()
  }

  #merge(partition: Partition): void {
    if (!partition.active) return
    partition.value.forEach((value, key) => {
      const existing = this.#value.get(key) || []
      this.#value.set(key, [...existing, ...value])
    })
  }

  public partition(): void {
    this.set(this.#cacheKey, new Map())
    this.#partitions.forEach((partition) => this.#merge(partition))
  }

  public setActive(id: string, active: boolean): void {
    this.#partitions.find((partition) => partition.id === id).active = active
    if (this.#value) return
    this.partition()
  }

  public get(key: string): PartitionValue {
    return this.#value.get(key) || []
  }

  public keys(): IterableIterator<string> {
    return this.#value.keys()
  }
}
