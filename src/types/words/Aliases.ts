type WordWithAliases<T extends string> = [T, RegExp?]
type Aliases<T extends string> = WordWithAliases<T>[]
