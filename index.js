import render from './site/server'

if (typeof document !== 'undefined') {
  require('./site/client').default()
}

export default render
