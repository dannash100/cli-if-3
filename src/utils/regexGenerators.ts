export type NonCaptureGroup = `(?:${string})`

export const anyOfWords = (words: string[]): NonCaptureGroup =>
  `(?:${words.join('|')})`
