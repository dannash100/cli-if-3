import { SystemCommands } from '../types/words/SystemCommands'
import { flattenAliases } from './utils'

export const systemCommands: Aliases<SystemCommands> = flattenAliases([
  [SystemCommands.Save, /save(?:\sgame)?/],
  [SystemCommands.Load, /load(?:\sgame)?/],
  [SystemCommands.Quit, /quit(?:\sgame)?/],
  [SystemCommands.Restart, /restart(?:\sgame)?/],
  [SystemCommands.Help, /help(?:\sme)?/],
  SystemCommands.Inventory,
])
