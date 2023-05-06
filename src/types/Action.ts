import { Condition } from './Condition'

export type Action = {
  text: string
  condition?: Condition[]
  action?: () => void
}
