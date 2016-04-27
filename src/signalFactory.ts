import staticTree, { Chain, Branch, ActionDescription } from './staticTree'

export interface Signal<T> {
  (payload?: T, options?: {}, extendContext?: any): void
}

export interface SignalEvent<T> {
  name: string,
  payload: T,
  options: {}
}

export interface ActionEvent<T> extends SignalEvent<T> {
  action: ActionDescription
}

export interface SignalEmitter<T> {
  (eventName: 'signalStart' | 'signalEnd' | 'change', eventData: SignalEvent<T> ): boolean
  (eventName: 'actionStart' | 'actionEnd', eventData: ActionEvent<T>): boolean
}

function createOutput (outputs: string[], resolve: any) {
  function next (path: string, payload: any) {
    resolve({ path: path, payload: payload })
  }

  if (outputs.length) {
    return next.bind(null, null)
    // return outputs.reduce(function (nextFn, key) {
    //   nextFn[key] = next.bind(null, key)
    // }, next.bind(null, null))
  } else {
    return next.bind(null, null)
  }
}

export default function createSignal<T> (
  signalName: string,
  signalChain: Chain,
  emit?: SignalEmitter<T>,
  defaultOptions?: {}
): Signal<T> {
  let tree = staticTree(signalChain) 

  return function signal (signalPayload, options, extendContext?) {
    emit('signalStart', { name: signalName, payload: signalPayload, options: options })
    
    function createContext (actionEvent:ActionEvent<T>, resolve: (value: {} | PromiseLike<{}>) => void) {
        let ctx = {
          input: actionEvent.payload,
          output: createOutput(Object.keys(actionEvent.action.outputs || {}), resolve)
        }

        if (extendContext) {
          ctx = extendContext(ctx, actionEvent)
        }

        return ctx
    }

    function runAction (actionEvent: ActionEvent<T>) {
      return new Promise<{}>((resolve, reject) => {
        let action = actionEvent.action

        let actionFunc = tree.actions[action.actionIndex]

        actionFunc(createContext(actionEvent, resolve))

        resolve()
      })
    }

    function runBranch (branch: Branch, index: number, payload: T) {
      let currentItem = branch[index]

      if (!currentItem) {
        if (branch === tree.branches) {
          emit('signalEnd', { name: signalName, payload: signalPayload, options: options })
          emit('change', { name: signalName, payload: signalPayload, options: options })
        }
        return
      } else if (/* ParallelActions */Array.isArray(currentItem)) {
        let currentBranch: ActionDescription[] = currentItem
      } else {
        let action: ActionDescription = currentItem
        let actionEvent: ActionEvent<T> = { action: action, name: signalName, payload: payload, options: options } 
        emit('actionStart', actionEvent)

        runAction(actionEvent).then(function (value) {
          emit('actionEnd', actionEvent)
          console.log(`output: ${value}`)
          runBranch(branch, index + 1, payload)
        })
      }
    }
    
    runBranch(tree.branches, 0, signalPayload)
  }
}
