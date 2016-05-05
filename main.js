var React = require('react')
var ReactDOM = require('react-dom')
var LoginForm = require('./dist/LoginFormStateful').default
require('./src/LoginForm.pcss')

var mountNode = document.getElementById('app')

function render () {
  ReactDOM.render(
    React.createElement('div', { style: { display: 'flex', height: '100vh' } },
      React.createElement('div', { style: { margin: 'auto' } }, React.createElement(LoginForm))
    ), mountNode
  )
}
render()
