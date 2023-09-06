import { ParentClass } from './Emitters'

describe('Emitters', () => {
  it('ejhejh', () => {
    const parent = new ParentClass()
    parent.children.forEach((child) => child.setActive(true))
  })
})
