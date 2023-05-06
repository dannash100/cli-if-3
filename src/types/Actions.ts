import { Action } from './Action'

enum GenericActions {
  disabled = 'disabled',
  default = 'default',
}

export type Actions<IdType extends string> = {
  [key in IdType | GenericActions]?: Action
}
