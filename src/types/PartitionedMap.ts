import { Observed, Trigger } from '../decorators/Observed'

const baseId = 'base'

enum PartitionTriggerId {
  ActiveChange = 'activeChange',
}

type MapValue = Map<string, { id: string; [key: string]: any }[]>

class Partition {
  public value: MapValue

  @Observed(PartitionTriggerId.ActiveChange)
  public active: boolean

  constructor(value: MapValue, active: boolean) {
    this.value = value
    this.active = active
  }

  setActive(active: boolean) {
    this.active = active
  }
}

export class PartitionedMap {
  public value: MapValue

  public isolatedPartition: string
  public partitions: {
    [id: string]: Partition
  }
  public base: MapValue

  #cache: {
    [key: string]: MapValue
  }

  get cacheKey() {
    return Object.keys(this.partitions)
      .filter((key) => this.partitions[key].active)
      .sort()
      .join('-')
  }

  constructor(
    base: Map<string, any>,
    partitions: { id: string; active: boolean; map: MapValue }[]
  ) {
    this.partitions = partitions.reduce(
      (acc: { [key: string]: Partition }, { id, active, map }) => ({
        ...acc,
        [id]: new Partition(map, active),
      }),
      {}
    )
    this.#cache = {
      [baseId]: base,
    }
    this.partition()
  }

  isolate(id: string) {
    this.value = this.partitions[id].value
    this.isolatedPartition = id
  }

  unite() {
    this.value = this.#cache[this.cacheKey]
    this.isolatedPartition = null
  }

  merge(id: string) {
    const partition = this.partitions[id]
    partition.value.forEach((value, key) => {
      const existing = this.value.get(key) || []
      this.value.set(key, [...existing, ...value])
    })
    partition.setActive(true)
  }

  remove(id: string) {
    const partition = this.partitions[id]
    partition.value.forEach((value, key) => {
      const existing = this.value.get(key)
      if (!existing)
        console.error(
          `Key ${key} does not exist in target of removed partition, this means that something weird happened `
        )
      const ids = value.map((v) => v.id)
      const newVal = existing.filter((v) => !ids.includes(v.id))
      if (!newVal.length) {
        this.value.delete(key)
      } else {
        this.value.set(key, newVal)
      }
    })
    partition.setActive(false)
  }

  @Trigger(PartitionTriggerId.ActiveChange)
  partition() {
    this.value = new Map(this.#cache[baseId])
    Object.entries(this.partitions).forEach(([id, partition]) => {
      if (partition.active) {
        this.merge(id)
      }
    })
    this.#cache[this.cacheKey] = new Map(this.value)
  }
}
