import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Slider,
} from 'react-native';

import Icon from './icon';
import Display from './display';
import ImageLoader from './image-loader';

const {colors} = require('./colors.json');

const animations = new ImageLoader().animations;

export default class Animations extends Component{
  constructor(props){
    super(props);
    this.state = {
      speed: 0.5,
      opt1: 0.5,
      opt2: 0.5,
    }
  }

  toMsg(i){
    var s = i.toString(16);
    if(s.length === 1) return '0'+s;
    return s;
  }

  onItemPressed(index){
    this.props.send("ANIMATION", this.toMsg(index), index, true);
  }

  onLongPressed(index){

  }


  onSliderChange(value, index){
    const cmd = ["SPEED", "OPT1", "OPT2"];
    this.props.send(cmd[index], this.toMsg(Math.round(value*255, 0)), null, true);
    var obj = {};
    switch(index){
      case 0: obj = {speed: value}; break;
      case 1: obj = {opt1: value}; break;
      case 2: obj = {opt2: value}; break;
    }
    this.setState(obj);
  }

  _renderItem(animation, index) {
    const {mode, selected} = this.props;
    const sel = mode == 0 ? (selected[0] == selected[1] ? selected[0]: -1): selected[mode-1];
    return (
      <TouchableHighlight key={index}
          onPress={()=>this.onItemPressed(index)}
          onLongPress={()=>this.onLongPressed(index)}
          delayPressin={0} delayLongPress={500}
          underlayColor={colors.blue+'44'}
          >
        <View style={[styles.header,
          index === sel ? {backgroundColor: colors.blue} : null,
          index === 0 ? null : {borderTopWidth: 0.3, borderColor: colors.lightgray}]}>
          <Display image={animation.image} />
        </View>
      </TouchableHighlight>
    );
  }

  _renderList() {
    l = [];
    for(i = 0; i < animations.length; i++){
      l.push(this._renderItem(animations[i], i));
    }
    return (l);
  }

  _renderSlider(){
    const {mode, selected} = this.props;
    const sel = mode == 0 ? (selected[0] == selected[1] ? selected[0]: -1): selected[mode-1];
    var l = [];
    var n = 1;
    if(sel != -1) n = animations[sel].opts;
    for(i = 0; i < n; i++){
      let x = i
      l.push(
        <Slider style={{flex: 1}}
          value={0.5}
          key={x}
          thumbTintColor={colors.blue}
          maximumTrackTintColor={colors.gray}
          minimumTrackTintColor={colors.lightgray}
          disabled={sel === -1}
          onValueChange={(speed) => this.onSliderChange(speed, x)} />
      );
    }
    return l;
  }

  _renderControlBar(){
    return(
      <View style={styles.controlBar}>
        {this._renderSlider()}
      </View>
    );
  }

  render(){
    return(
      <View style={styles.container}>
        <ScrollView style={styles.container}>
          {this._renderList()}
        </ScrollView>
        {this._renderControlBar()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBar: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.8,
    borderColor: colors.gray,
    paddingHorizontal: 15,
  },
  iconTouch: {
    flex:1,
    alignItems: 'center'
  },
  icon: {
    tintColor: colors.icon,
  }
});
