import { ID } from './ID'
import { ItemId } from './Item'
import { Matcher } from './Matcher'
import { WordList } from './words/Generic'
import { Verbs } from './words/Verbs'

export type PropId = ID<'prop'>

export type Prop = {
  id: PropId
  name: string
  matcher: Matcher
  descriptions: {}
  interactions: {
    [key in Verbs | WordList<Verbs>]?: {
      [key: ItemId]: {}
    }
  }
}

function Any<T extends string>(...verbs: T[]) {
  return verbs.join(',') as WordList<T>
}

// const HasProgress = (id: string) => (ctx: any) => true
// const EnablePath = (sceneId: SceneId)

const door: Prop = {
  id: 'prop-door',
  name: 'door',
  matcher: {
    base: 'door',
    attributes: ['wooden', 'locked'],
  },

  interactions: {
    [Any(Verbs.Unlock, Verbs.Use)]: {
      ['item-key']: {
        destroy: true,
        text: 'You unlock the door with the key.',
        actions: [EnablePath('north')],
      },
      ['item-knife']: [
        {
          text: "You try to unlock the door with the knife, but it doesn't work.",
          repeat: 2,
        },
        {
          repeat: true, // repeats indefinitely
          text: 'Its no use, the knife wont fit in the lock.',
        },
      ],
    },
    [Verbs.Push]: {
      ['item-rod']: If(HasProgress('progress-killeddragon'), []).else([]),
    },
  },
}
