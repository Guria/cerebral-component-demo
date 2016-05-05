import { createElement, Component, SyntheticEvent, ReactNode } from 'react'
import { staticTree, executeTree, Chain, Action, ActionResult, ActionDescription } from 'action-tree'
import LoginForm, { LoginFormProps, LoginFormData } from './LoginForm'
import assign = require('object-assign')

// Setup

const TIMEOUT = 3000

function createSignal<T> (chain: Chain, setState: (state: any) => void) {
  let tree = staticTree(chain)

  function runAction (action: ActionDescription, payload: T) {
    return new Promise<ActionResult<T>>((resolve, reject) => {
      let actionFunc = tree.actions[action.actionIndex]
      let timeout = action.isAsync && setTimeout(() => { reject() }, TIMEOUT)

      let result: ActionResult<T>

      function outputFn (path: string, outputPayload?: T) {
        result = {
          path: path,
          payload: outputPayload
        }

        if (action.isAsync) {
          clearTimeout(timeout)
          resolve(result)
        }
      }

      actionFunc(payload, outputFn, action.isAsync ? null : setState)

      if (!action.isAsync) { resolve(result) }
    })
  }

  return function (payload: T) {
    executeTree(tree.tree, runAction, payload)
  }
}

interface ReactAction<T> extends Action {
  (
    input?: T,
    output?: (path: string, payload?: T) => void,
    setState?: (state: T) => void
  ): void
}

// Actions

let copyInputToState: ReactAction<any> = (input, output, setState) => {
  setState(input)
}

let postForm: ReactAction<LoginFormData> = (input, output) => {
  // do xhr here
  setTimeout(() => {
    if (input.login === 'foo' && input.password === 'bar') {
      output('success')
    } else {
      output('error')
    }
  }, 1000)
}
postForm.async = true

let redirect: ReactAction<any> = () => {
  alert('success')
}

let reset: ReactAction<LoginFormData> = (input, output, setState) => {
  setState({
    login: 'foo',
    password: 'bar'
  })
}

// Factories

function set (key: string, value: any): ReactAction<any> {
  return (input, output, setState) => {
    setState({ [key]: value })
  }
}


function unset (key: string): ReactAction<any> {
  return (input, output, setState) => {
    setState({ [key]: null })
  }
}

// Chains

let formChanged: Chain = [
  unset('error'),
  copyInputToState
]

let formSubmitted: Chain = [
  unset('error'),
  set('submitting', true),
  postForm, {
    success: [ redirect ],
    error: [ set('error', 'invalid') ]
  },
  unset('submitting')
]

let lostPasswordClicked: Chain = [
  unset('error'),
  reset
]

// Component

export default class extends Component<{}, {}> {
  signals: any
  constructor () {
    super()
    let setState = this.setState.bind(this)
    
    this.signals = {
      onFormChange: createSignal(formChanged, setState),
      onFormSubmit: createSignal(formSubmitted, setState),
      onLostPasswordClick: createSignal(lostPasswordClicked, setState)
    }
  }
  render () {
    return createElement(LoginForm, assign<LoginFormProps>({}, this.state, this.signals))
  }
}
