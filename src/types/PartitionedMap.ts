import { Observed, Trigger } from '../decorators/Observed'

const baseId = 'base'

enum PartitionTriggerId {
  ActiveChange = 'activeChange',
}

type MapValue = Map<string, { id: string; [key: string]: any }[]>

class Partition extends Map<string, any[]> {
  @Observed(PartitionTriggerId.ActiveChange)
  public active: boolean

  constructor(val: MapValue, active: boolean) {
    super(val)
    this.active = active
  }

  setActive(active: boolean) {
    this.active = active
  }
}

export class PartitionedMap extends Map<string, any[]> {
  #value: MapValue

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
    super(base)
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
    partition.forEach((value, key) => {
      const existing = super.get(key) || []
      super.set(key, [...existing, ...value])
    })
    partition.setActive(true)
  }

  remove(id: string) {
    const partition = this.partitions[id]
    partition.forEach((value, key) => {
      const existing = super.get(key)
      if (!existing)
        console.error(
          `Key ${key} does not exist in target of removed partition, this means that something weird happened `
        )
      const ids = value.map((v) => v.id)
      const newVal = existing.filter((v) => !ids.includes(v.id))
      if (!newVal.length) {
        super.delete(key)
      } else {
        super.set(key, newVal)
      }
    })
    partition.setActive(false)
  }

  @Trigger(PartitionTriggerId.ActiveChange)
  partition() {
    if (this.#cache[this.cacheKey]) {
      this.clear()
      Object.setPrototypeOf(
        Object.getPrototypeOf(this),
        new Map(this.#cache[this.cacheKey])
      )
      console.log(this)
    }
    Object.entries(this.partitions).forEach(([id, partition]) => {
      if (partition.active) {
        this.merge(id)
      }
    })
    this.#cache[this.cacheKey] = [...this.entries()]
  }
}
