import { EventTrigger } from '../decorators/Observed'
import { entityLogger } from '../utils/logger'
import { EntityNames } from './EntityNames'

type PartitionValue = any[]
// type Partition = {
//   id: string
//   active: boolean
//   isolated: boolean
//   value: Map<string, PartitionValue>
// }

type CacheValue = Map<string, PartitionValue>

export enum TriggerId {
  ActiveChange = 'activeChange',
}

class Partition {
  id: string
  active: boolean
  isolated: boolean
  value: Map<string, PartitionValue>

  constructor(values) {
    Object.assign(values, this)
  }
}
export class PartitionedMap extends Map<string, CacheValue | PartitionValue> {
  log = entityLogger(EntityNames.PartitionedMap)
  #partitions: Partition[]

  get #isolatedPartition() {
    return this.#partitions.find((partition) => partition.isolated)
  }

  get #cacheKey() {
    return (
      this.#isolatedPartition?.id ||
      this.#partitions
        .filter((partition) => partition.active)
        .map((partition) => partition.id)
        .sort()
        .join('-')
    )
  }

  get #value() {
    return super.get(this.#cacheKey) as CacheValue
  }

  constructor(base: CacheValue, partitions: Partition[]) {
    super()

    this.log(`Creating map with ${partitions.length} partitions`)
    this.#partitions = [
      { id: 'base', active: true, isolated: false, value: base },
      ...partitions,
    ]
    this.partition()
  }

  #merge(partition: Partition): void {
    if (
      (this.#isolatedPartition &&
        this.#isolatedPartition?.id !== partition.id) ||
      !partition.active
    )
      return
    partition.value.forEach((value, key) => {
      const existing = this.#value.get(key) || []
      this.#value.set(key, [...existing, ...value])
    })
  }

  @EventTrigger(TriggerId.ActiveChange)
  public partition(): void {
    this.set(this.#cacheKey, new Map())
    this.#partitions.forEach((partition) => this.#merge(partition))
  }

  public setActive(id: string, active: boolean): void {
    this.#partitions.find((partition) => partition.id === id).active = active
    if (this.#value) return
    this.partition()
  }

  public isolate(id: string): void {
    this.#partitions.find((partition) => partition.id === id).isolated = true
    this.partition()
  }

  public unisolate() {
    if (!this.#isolatedPartition) return
    this.#isolatedPartition.isolated = false
    // todo trigger
    this.partition()
  }

  public get(key: string): PartitionValue {
    return this.#value.get(key) || []
  }

  public keys(): IterableIterator<string> {
    return this.#value.keys()
  }
}
