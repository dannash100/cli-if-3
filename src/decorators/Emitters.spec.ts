import {
  Emittable,
  EventTrigger,
  ObserveChange,
  ObserveChildren,
} from './Emitters'

enum TestTriggerIds {
  ActiveChange = 'activeChange',
  CountChange = 'countChange',
  ToggleChange1 = 'toggleChange1',
  ToggleChange2 = 'toggleChange2',
  FirstNameChange = 'firstNameChange',
  LastNameChange = 'lastNameChange',
  AgeChange = 'ageChange',
}

export class GrandChildClass {
  public id: string

  @ObserveChange(TestTriggerIds.AgeChange)
  public age: number

  constructor(id) {
    this.id = id
  }

  public setAge(age: number) {
    this.age = age
  }
}

export class ChildClass {
  public id: string

  @ObserveChildren()
  public child: GrandChildClass

  @ObserveChange(TestTriggerIds.ActiveChange)
  public active

  @ObserveChange(TestTriggerIds.CountChange)
  public count

  @ObserveChange(TestTriggerIds.ToggleChange1, TestTriggerIds.ToggleChange2)
  public toggle

  @ObserveChange(TestTriggerIds.FirstNameChange)
  public firstName

  @ObserveChange(TestTriggerIds.LastNameChange)
  public lastName

  constructor(id) {
    this.id = id
    this.child = new GrandChildClass('FD')
  }

  setActive(active: boolean) {
    this.active = active
  }

  incrementCount() {
    const n = (this.count || 0) + 1
    this.count = n
  }

  flipToggle() {
    this.toggle = !this.toggle
  }

  setName(first: string, last: string) {
    this.firstName = first
    this.lastName = last
  }
}

export class ParentClass<CType> {
  @ObserveChildren()
  public children: CType[] | CType

  constructor(children?: CType[] | CType) {
    // This works in terms of order
    // const triggers = Reflect.getMetadata('eventTriggers', this)
    // @Reflect.metadata('eventTriggers', triggers)
    // class C extends children.constructor.prototype {}
    // this.children = new C('b')
    this.children = children
  }

  @EventTrigger(TestTriggerIds.ActiveChange)
  public respondActiveChange(id) {
    return id
  }

  @EventTrigger(TestTriggerIds.CountChange)
  public respondCountChange(id) {
    return id
  }

  @EventTrigger(TestTriggerIds.ToggleChange1)
  public respondToggleChange1(id) {
    return id
  }

  @EventTrigger(TestTriggerIds.ToggleChange2)
  public respondToggleChange2(id) {
    return id
  }

  @EventTrigger(TestTriggerIds.FirstNameChange, TestTriggerIds.LastNameChange)
  public respondNameChange(id) {
    return id
  }

  @EventTrigger(TestTriggerIds.AgeChange)
  public respondAgeChange(id) {
    return id
  }
}

describe('Emitters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('children array triggers parent class', () => {
    const respondSpy = jest.spyOn(ParentClass.prototype, 'respondActiveChange')
    const parent = new ParentClass([new ChildClass('a'), new ChildClass('b')])
    const children = parent.children as ChildClass[]
    children.forEach((child) => child.setActive(true))
    expect(respondSpy).toHaveBeenCalledTimes(2)
    expect(respondSpy).toHaveBeenNthCalledWith(1, 'a')
    expect(respondSpy).toHaveBeenNthCalledWith(2, 'b')
  })
  it('singular child triggers parent class', () => {
    const respondSpy = jest.spyOn(ParentClass.prototype, 'respondActiveChange')
    const parent = new ParentClass(new ChildClass('a'))
    const child = parent.children as ChildClass
    child.setActive(true)
    expect(respondSpy).toHaveBeenCalledTimes(1)
    expect(respondSpy).toHaveBeenCalledWith('a')
  })
  it('multiple change observers across different properties', () => {
    const respondActiveSpy = jest.spyOn(
      ParentClass.prototype,
      'respondActiveChange'
    )
    const respondCountSpy = jest.spyOn(
      ParentClass.prototype,
      'respondCountChange'
    )
    const parent = new ParentClass(new ChildClass('a'))
    const child = parent.children as ChildClass
    child.setActive(true)
    child.incrementCount()
    child.incrementCount()
    expect(respondActiveSpy).toHaveBeenCalledTimes(1)
    expect(respondCountSpy).toHaveBeenCalledTimes(2)
  })
  it('multiple change observer ids with two different method triggers', () => {
    const tChange1Spy = jest.spyOn(
      ParentClass.prototype,
      'respondToggleChange1'
    )
    const tChange2Spy = jest.spyOn(
      ParentClass.prototype,
      'respondToggleChange2'
    )
    const parent = new ParentClass(new ChildClass('a'))
    const child = parent.children as ChildClass
    child.flipToggle()
    expect(tChange1Spy).toHaveBeenCalledTimes(1)
    expect(tChange2Spy).toHaveBeenCalledTimes(1)
  })
  it('multiple change observers across different properties triggering one method', () => {
    const nameChangeSpy = jest.spyOn(ParentClass.prototype, 'respondNameChange')
    const parent = new ParentClass(new ChildClass('a'))
    const child = parent.children as ChildClass
    child.setName('Daniel', 'Nash')
    expect(nameChangeSpy).toHaveBeenCalledTimes(2)
  })
  // Not working
  it('parent can observe change on grandchild class', () => {
    const ageChangeSpy = jest.spyOn(ParentClass.prototype, 'respondAgeChange')
    const parent = new ParentClass(new ChildClass('a'))
    const child = parent.children as ChildClass
    child.child.setAge(10)
    expect(ageChangeSpy).toHaveBeenCalledTimes(1)
  })
})
