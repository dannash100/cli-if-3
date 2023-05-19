import { generateMapString, mapTemplate } from './map'

describe('generateMapString', () => {
  it('should generate map string from mapTemplate', () => {
    const result = generateMapString(mapTemplate)
    expect(result).toBe(
      `  _______________________
 / \\                      \\
|   |    █-█-█-█-█-█-█    |
 \\_ |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |  ___________________|__
    \\_/_____________________/`
    )
  })

  it('should generate map string for small map', () => {
    const customMap = mapTemplate.slice(0, 3)
    const result = generateMapString(customMap)
    expect(result).toBe(
      `  _______________________
 / \\                      \\
|   |    █-█-█-█-█-█-█    |
 \\_ |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |  ___________________|__
    \\_/_____________________/`
    )
  })
  it('should generate map string for large map', () => {
    const customMap = [...mapTemplate, mapTemplate[1], ...mapTemplate]
    const result = generateMapString(customMap)
    expect(result).toBe(
      `  _______________________
 / \\                      \\
|   |    █-█-█-█-█-█-█    |
 \\_ |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |    │╲│╱│╲│╱│╲│╱│    |
    |    █-█-█-█-█-█-█    |
    |  ___________________|__
    \\_/_____________________/`
    )
  })
  it('should generate map with missing paths', () => {
    const customMap = mapTemplate.map((x) =>
      x.map((y) => (['╲', '╱'].includes(y) ? ' ' : y))
    )
    console.log(customMap)
    const result = generateMapString(customMap)
    expect(result).toBe(
      `  _______________________
 / \\                      \\
|   |    █-█-█-█-█-█-█    |
 \\_ |    │ │ │ │ │ │ │    |
    |    █-█-█-█-█-█-█    |
    |    │ │ │ │ │ │ │    |
    |    █-█-█-█-█-█-█    |
    |    │ │ │ │ │ │ │    |
    |    █-█-█-█-█-█-█    |
    |    │ │ │ │ │ │ │    |
    |    █-█-█-█-█-█-█    |
    |  ___________________|__
    \\_/_____________________/`
    )
  })
})
