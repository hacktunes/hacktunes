import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import { LevelsRecord } from '../constants/recordTypes'

export default function Levels({ levels }) {
  return (
    <div className="levels">
      <div className={classNames('level', 'left', levels.leftClip && 'clipping')}>
        <div className="dark" style={{'width': `${100 * levels.leftAvg}%`}} />
        <div className="light" style={{'width': `${100 * levels.leftMax}%`}} />
      </div>
      <div className={classNames('level', 'right', levels.rightClip && 'clipping')}>
        <div className="dark" style={{'width': `${100 * levels.rightAvg}%`}} />
        <div className="light" style={{'width': `${100 * levels.rightMax}%`}} />
      </div>
    </div>
  )
}

Levels.propTypes = {
  levels: PropTypes.object,
}

Levels.defaultProps = {
  levels: LevelsRecord(),
}
