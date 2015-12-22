import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { LevelsRecord } from '../reducers/playerMetrics'

function widthPercent(frac) {
  return { 'width': `${100 * frac}%` }
}

export default function Levels({ levels }) {
  return (
    <div className="levels">
      <div className={classNames('level', 'left', levels.leftClip && 'clipping')}>
        <div className="dark" style={widthPercent(levels.leftAvg)} />
        <div className="light" style={widthPercent(levels.leftMax)} />
      </div>
      <div className={classNames('level', 'right', levels.rightClip && 'clipping')}>
        <div className="dark" style={widthPercent(levels.rightAvg)} />
        <div className="light" style={widthPercent(levels.rightMax)} />
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
