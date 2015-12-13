import React, { Component, PropTypes } from 'react'

export default function Levels({ leftDark, leftLight, rightDark, rightLight }) {
  return (
    <div className="levels">
      <div className="level left">
        <div className="dark" style={{'width': `${100 * leftDark}%`}} />
        <div className="light" style={{'width': `${100 * leftLight}%`}} />
      </div>
      <div className="level right">
        <div className="dark" style={{'width': `${100 * rightDark}%`}} />
        <div className="light" style={{'width': `${100 * rightLight}%`}} />
      </div>
    </div>
  )
}

Levels.propTypes = {
  leftDark: PropTypes.number.isRequired,
  leftLight: PropTypes.number.isRequired,
  rightDark: PropTypes.number.isRequired,
  rightLight: PropTypes.number.isRequired,
}
