import { Chain, ActionFunc } from './staticTree'
import createSignal from './signalFactory'
import { EventEmitter } from 'events'

let emitter = new EventEmitter()

interface Action extends ActionFunc {
  (ctx: any): void
}

function sync (name: string, path?: string) { 
  let action: ActionFunc = (ctx) => {
    console.log(`action: ${name}, input: ${JSON.stringify(ctx.input)}`)
    path && ctx.output && ctx.output()
  }
  action.displayName = name
  return action
}
function async (name: string, path?: string) { 
  let action = sync(name, path)
  action.async = true
  return action
}

let signalChain: Chain = [
  sync('a'),
  async('b', 'foo'), {
    'foo': [ sync('b.foo.a'), async('b.foo.b') ],
    'bar': [ sync('b.bar.a'), async('b.bar.b') ]
  },
  [
    async('d'), {
      'foo': [ sync('d.foo.a'), async('d.foo.b') ],
      'bar': [ sync('d.bar.a'), async('d.bar.b'), {
        'foo': [ sync('d.bar.b.foo.a'), async('d.bar.b.foo.b') ],
        'bar': [ sync('d.bar.b.bar.a'), async('d.bar.b.bar.b') ]
      } ]
    }
  ],
  // { 'foo': [] } // runtime error only
]

let signal = createSignal('smthHappened', signalChain, emitter.emit.bind(emitter))

emitter.on('signalStart', console.log.bind(console, 'signalStart: '))
emitter.on('signalEnd', console.log.bind(console, 'signalEnd: '))
emitter.on('actionStart', console.log.bind(console, 'actionStart: '))
emitter.on('actionEnd', console.log.bind(console, 'actionEnd: '))
emitter.on('change', console.log.bind(console, 'change: '))

signal({ foo: 'bar' })
