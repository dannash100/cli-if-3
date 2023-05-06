export const flattenAliases = <T extends string>(
  list: (T | [T, RegExp])[]
): Aliases<T> => list.map((p) => [p].flat() as WordWithAliases<T>)

export const rootWord = <T extends string>(word: string, list: Aliases<T>): T =>
  list.find(([root, regex]) =>
    regex ? new RegExp(`^${regex.source}$`)?.test(word) : root === word
  )?.[0] as T
