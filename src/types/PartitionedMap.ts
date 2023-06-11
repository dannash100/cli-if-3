const baseId = 'base'

class Partition {
  public value: Map<string, any>
  public active: boolean

  constructor(value: Map<string, any[]>, active: boolean) {
    this.value = value
    this.active = active
  }

  setActive(active: boolean) {
    this.active = active
  }
}

export class PartitionedMap {
  public value: Map<string, any[]>

  public isolatedPartition: string
  public partitions: {
    [id: string]: Partition
  }
  public base: Map<string, any[]>

  #cache: {
    [key: string]: Map<string, any[]>
  }

  get cacheKey() {
    return Object.keys(this.partitions)
      .filter((key) => this.partitions[key].active)
      .sort()
      .join('-')
  }

  constructor(
    base: Map<string, any>,
    partitions: { id: string; active: boolean; map: Map<string, any[]> }[]
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
      const existing = this.value.get(key)
      const newVal = existing
        ? Array.isArray(existing)
          ? [...existing, ...(Array.isArray(value) ? value : [value])]
          : [existing, ...(Array.isArray(value) ? value : [value])]
        : value
      this.value.set(key, newVal)
    })
  }

  split(id: string) {
    const partition = this.partitions[id]
    partition.value.forEach((value, key) => {
      const existing = this.value.get(key)
      const existingArray = Array.isArray(existing) ? existing : [existing]
      const valueArray = Array.isArray(value) ? value : [value]
      const newArr = existingArray.filter((item) => !valueArray.includes(item))
      if (newArr.length) {
        this.value.set(key, newArr.length === 1 ? newArr[0] : newArr)
      } else {
        this.value.delete(key)
      }
    })
  }

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
// `${key1}@${key2}`.replace(new RegExp(`(?:(${key1}-?)(${key2}-?))`, 'g'), (match, p1, p2) => {

// });
