import React from 'react'
import reactor from '../../state/reactor'
import Router from 'react-router'
import Store from '../../state/main'
import RenderLayers from './RenderLayers'
import ColorsButton from '../ColorsButton'
import CheckButton from '../CheckButton'
import {imageUrlForLayer} from '../../state/utils'
var classNames = require('classnames')
var Hammer = require('react-hammerjs')

export default React.createClass({
  mixins: [reactor.ReactMixin, Router.State, Router.Navigation],

  getDataBindings() {
    return {
      design: Store.getters.currentDesign,
      currentLayer: Store.getters.currentLayer
    }
  },

  componentWillMount() {
    Store.actions.selectDesignAndLayerId({designId: this.props.params.designId, layerId: this.props.params.layerId})
  },

  componentWillUnmount() {
    clearInterval(this._interval)
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps !== this.props || nextState !== this.state) {
      return true
    }
    return false
  },

  attemptLoadResources() {
    this._interval = setInterval(() => {
      var svgs = document.querySelectorAll('.canvas svg')
      if (svgs.length === 3) {
        clearInterval(this._interval)
        Store.actions.loadCurrentDesignEditResources()
      }
    }, 50)
  },

  componentDidMount() {
    this.attemptLoadResources()
  },

  handleSwipe(e) {
    var direction = e.direction
    if (direction === 2) {
      console.log('SWIPE LEFT')
    } else if (direction === 4) {
      console.log('SWIPE RIGHT')
    }
  },

  handlePan(e) {
   console.log('GOT PAN: ', e)
  },

  selectLayer(layer) {
    Store.actions.selectLayerId(layer.get('id'))
    this.transitionTo('designEdit', {designId: this.state.design.get('id'), layerId: layer.get('id')})
  },

  toggleCurrentLayer() {
    Store.actions.toggleCurrentLayer()
  },

  editLayerDetail() {
    this.transitionTo('designEditDetail', {designId: this.state.design.get('id'), layerId: this.state.currentLayer.get('id'), imagesOrColors: 'images'})
  },

  render() {
    console.log('render')
    if (this.state.design == null || this.state.currentLayer == null) { return null }
    console.log('render2')
    var imgSize = 60
    var layers = this.state.design.get('layers').reverse().map(layer => {
    var isSelected = this.state.currentLayer.get('id') === layer.get('id')
      return (
        <div className="layer-selector"
             onClick={this.selectLayer.bind(null, layer)}>
          <img src={imageUrlForLayer(layer)} width={imgSize} height={imgSize}
               className={classNames({selected: isSelected})}/> 
          
          {isSelected ?
            <span onClick={this.toggleCurrentLayer()}>eye</span>
          : null}

          {isSelected ?
            <span onClick={this.editLayerDetail()}>more</span>
          : null}
        </div>
      )
    })

    return (
      <section className="main design-edit">

        <div className="canvas-flex-wrapper">
          <Hammer onSwipe={this.handleSwipe} onPan={this.handlePan}>
            <RenderLayers layers={this.state.design.get('layers')}/>
          </Hammer>
        </div>

        <div className="edit-ui">
          <div className="edit-steps">
            <ColorsButton isSmall={false}
                          onLeftClick={Store.actions.previousDesignColors}
                          onRightClick={Store.actions.nextDesignColors}/>
            <CheckButton isSmall={false}/>
            {layers}
          </div>
        </div>

      </section>
    )
  }
})
