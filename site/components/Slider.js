import React, { Component, PropTypes } from 'react'
import clamp from '../lib/clamp'

export default class Slider extends Component {
  componentDidMount() {
    this._updateHandle = this.updateHandle.bind(this)
    this._handleMouseMove = this.handleMouseMove.bind(this)
    this._handleMouseUp = this.handleMouseUp.bind(this)
    window.addEventListener('resize', this._updateHandle, false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateHandle, false)
    window.removeEventListener('mousemove', this._handleMouseMove, false)
    window.removeEventListener('mouseup', this._handleMouseUp, false)
  }

  componentDidUpdate() {
    this.updateHandle()
  }

  handleMouseDown(ev) {
    if (ev.button !== 0) {
      return
    }

    ev.preventDefault()
    window.addEventListener('mousemove', this._handleMouseMove, false)
    window.addEventListener('mouseup', this._handleMouseUp, false)

    const value = this._getValuefromEv(ev)

    if (this.props.onGrab) {
      this.props.onGrab(value)
    }

    if (this.props.onMove) {
      this.props.onMove(value)
    }
  }

  handleMouseUp() {
    window.removeEventListener('mousemove', this._handleMouseMove, false)
    window.removeEventListener('mouseup', this._handleMouseUp, false)

    if (this.props.onRelease) {
      this.props.onRelease(this.props.value)
    }
  }

  handleMouseMove(ev) {
    if (this.props.onMove) {
      this.props.onMove(this._getValuefromEv(ev))
    }
  }

  _getValuefromEv(ev) {
    const box = this.refs.slider.getBoundingClientRect()
    const x = ev.clientX
    return clamp(0, (x - box.left) / box.width, 1)
  }

  updateHandle() {
    const sliderWidth = this.refs.slider.offsetWidth
    const handleWidth = this.refs.handle.offsetWidth
    const position = sliderWidth * this.props.value - handleWidth / 2
    this.refs.handle.style.transform = `translateX(${position}px)`
  }

  render() {
    return (
      <div
        {...this.props}
        ref="slider"
        onMouseDown={this.handleMouseDown.bind(this)}
      >
        <div ref="handle" className="handle">
          {this.props.children}
        </div>
      </div>
    )
  }
}

Slider.propTypes = {
  onGrab: PropTypes.func,
  onMove: PropTypes.func,
  onRelease: PropTypes.func,
  children: PropTypes.node.isRequired,
}
