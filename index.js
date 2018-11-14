import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, PanResponder, ViewPropTypes } from 'react-native';

// Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

export default class PinchZoomView extends Component {
  static propTypes = {
    ...viewPropTypes,

    scalable: PropTypes.bool,
    minScale: PropTypes.number,
    maxScale: PropTypes.number
  };

  static defaultProps = {
    scalable: true,
    minScale: 0.5,
    maxScale: 2
  };

  constructor(props) {
    super(props);
    this.state = {
      maxX: 30,
      maxY: 30,
      scale: 1,
      lastScale: 1,
      offsetX: 0,
      offsetY: 0,
      lastX: 0,
      lastY: 0,
      lastMovePinch: false
    };
    this.distant = 150;
  }

  componentWillMount() {
    this.gestureHandlers = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: evt => true,
      onShouldBlockNativeResponder: evt => false
    });
  }

  _handleStartShouldSetPanResponder = (e, gestureState) => {
    // don't respond to single touch to avoid shielding click on child components
    return false;
  };

  _handleMoveShouldSetPanResponder = (e, gestureState) => {
    return (
      this.props.scalable &&
      (Math.abs(gestureState.dx) > 2 ||
        Math.abs(gestureState.dy) > 2 ||
        gestureState.numberActiveTouches === 2)
    );
  };

  _handlePanResponderGrant = (e, gestureState) => {
    if (gestureState.numberActiveTouches === 2) {
      let dx = Math.abs(
        e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX
      );
      let dy = Math.abs(
        e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY
      );
      let distant = Math.sqrt(dx * dx + dy * dy);
      this.distant = distant;
    }
  };

  _handlePanResponderEnd = (e, gestureState) => {
    this.setState({
      lastX: this.state.offsetX,
      lastY: this.state.offsetY,
      lastScale: this.state.scale
    });
  };

  _handlePanResponderMove = (e, gestureState) => {
    // zoom
    if (gestureState.numberActiveTouches === 2) {
      let dx = Math.abs(
        e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX
      );
      let dy = Math.abs(
        e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY
      );
      let distant = Math.sqrt(dx * dx + dy * dy);

      if (distant <= 200) {
       
        this.setState({ scale:this.props.minScale,lastMovePinch: true });

      }
      let scale = (distant / this.distant) * this.state.lastScale;
      //check scale min to max hello
      if (scale < this.props.maxScale && scale > this.props.minScale) {
        this.setState({ scale, lastMovePinch: true });
      }
    }
    // translate
    else if (gestureState.numberActiveTouches === 1) {

      if(Math.floor(this.state.scale) <= this.props.minScale) {
        //pervent panning when screen is zoomed outthis.setState({ offsetX:0, offsetY:0, lastMovePinch: false });
        this.setState({ offsetX:0, offsetY:0, lastMovePinch: false });
        return;

      
      } else {
        this.pinchZoom.measure((fx, fy, width, height, px, py)=>{
        
          //going left
          if(gestureState.dx < 0){
            
            if(px  < -(width-10) ) {
              return;

            }
            
          } else if( gestureState.dx > 0 ) {
          
            if(px > 30) {
              return;

            }
           
         
          }

          if (this.state.lastMovePinch) {
            gestureState.dx = 0;
            gestureState.dy = 0;
          }
          let offsetX = this.state.lastX + gestureState.dx / this.state.scale;
          let offsetY = 0;
          
          this.setState({ offsetX, offsetY, lastMovePinch: false });
         
        }); 

    

   

      }
    
     
    }
  };

  render() {
    return (
      <View onLayout ={(event)=>{
        this.setState({maxX:event.nativeEvent.layout.width})
        this.setState({maxY:event.nativeEvent.layout.height})
        console.log ("onlayout",event.nativeEvent)}}
        {...this.gestureHandlers.panHandlers}
        ref ={view =>{this.pinchZoom = view ;}}
        style={[
          styles.container,
          this.props.style,
          {
            transform: [
              { scaleX: this.state.scale },
              { scaleY: this.state.scale },
              { translateX: this.state.offsetX },
              { translateY: this.state.offsetY }
            ]
          }
        ]}
      >
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
