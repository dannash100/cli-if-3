import { ProgressId } from './types/Progress'

type Predicate = (ctx: Context) => boolean

type Actions<T> = T[]
type Context = any

export function If<ActionType extends any>(
  predicate: Predicate,
  actions: Actions<ActionType>
) {
  return {
    defaultActions: [],
    conditionList: [[actions, predicate]],
    condition(ctx: Context) {
      const [actionsMatch] = this.conditionList.find(([_, ifPredicate]) =>
        ifPredicate(ctx)
      ) || [this.defaultActions]
      return actionsMatch
    },
    elseIf(elseIfPredicate: Predicate, elseIfActions: Actions<ActionType>) {
      this.conditionList.push([elseIfActions, elseIfPredicate])
      return this
    },
    else(elseActions: Actions<ActionType>) {
      this.defaultActions = elseActions
      // Stop the chain
      return {
        condition: this.condition.bind(this),
      }
    },
  }
}
export function Any(...predicates: Predicate[]): Predicate {
  return (ctx: Context) => predicates.some((predicate) => predicate(ctx))
}

export function All(...predicates: Predicate[]): Predicate {
  return (ctx: Context) => predicates.every((predicate) => predicate(ctx))
}

export const HasProgress = (id: ProgressId) => (ctx: Context) =>
  ctx.progress[progress]

// enum PredicateType {
//   And = 'and',
//   Or = 'or'
// }

// type WrappedPredicate = {
//   end: () => Predicate
//   or?: (Predicate: Predicate) => WrappedPredicate;
//   and?: (Predicate: Predicate) => WrappedPredicate;
// };

// This can be replaced by just Any and All as does same thing
// export function Predicate(predicate: Predicate) {
//   return {
//     type: null,
//     predicates: [predicate],
//     end() {
//       return (ctx: Context) => {
//         if (this.type === PredicateType.Or) {
//           return this.predicates.some((predicate) => predicate(ctx))
//         } else if (this.type === PredicateType.And) {
//           return this.predicates.every((predicate) => predicate(ctx))
//         } else {
//           return predicate(ctx)
//         }
//       }
//     },
//     and(predicate: Predicate): Omit<WrappedPredicate, 'or'> {
//       this.type = PredicateType.And
//       this.predicates.push(predicate)
//       return {
//         and: this.and.bind(this),
//         end: this.end.bind(this),
//       }
//     },
//     or(predicate: Predicate): Omit<WrappedPredicate, 'and'> {
//       this.type = PredicateType.Or
//       this.predicates.push(predicate)
//       return {
//         or: this.or.bind(this),
//         end: this.end.bind(this),
//       }
//     }
//   }
// }
