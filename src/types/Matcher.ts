/**
 * {
 *  base: 'key',
 *  attributes: ['red', 'rusty']
 * }
 * {
 *  base: 'key',
 *  attributes: ['blue', 'rusty']
 * }
 * Get key
 * => Which key?
 * Get rusty key
 * => Which rusty key?
 * Get green key
 * => I can't see a green key.
 * Get red key
 * => You pickup the red key.
 */
export type Matcher = {
  base: string
  aliases?: string[]
  attributes?: string[]
}
