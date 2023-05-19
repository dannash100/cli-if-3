/**
 *
 * @example
 * // returns cat dog
 * distinctWords("dog dog cat dog")
 * @example
 * // returns monkey cat dog
 * distinctWords("cat monkey cat cat dog dog monkey monkey cat dog")
 */
export const distinctWords = (str: string) =>
  str.replace(/(\b\w+)\s+(?=.*?\1\b)/gi, '')
