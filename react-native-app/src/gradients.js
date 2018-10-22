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

const gradients = new ImageLoader().gradients;

const ic_play = require('./icons/play.png');
const ic_pause = require('./icons/pause.png');
const ic_change = require('./icons/change.png');


export default class Gradients extends Component{
  constructor(props){
    super(props);
    this.state = {
      speed: 0.5,
      play: false,
      fade: false,
    }
  }

  toMsg(i){
    var s = i.toString(16);
    if(s.length === 1) return '0'+s;
    return s;
  }

  onItemPressed(index){
    this.props.send("GRADIENT", this.toMsg(index), index, true);
  }

  onLongPressed(index){

  }

  onPlayPressed(){
    var msg = !this.state.fade ? (!this.state.play ? '01' : '00'): (!this.state.play ? '02' : '03');
    this.props.send("MODE", msg, null, true);
    this.setState({play: !this.state.play});
  }

  onChangePressed(){
    var msg = this.state.fade ? (this.state.play ? '01' : '00'): (this.state.play ? '02' : '03');
    this.props.send("MODE", msg, null, true);
    this.setState({fade: !this.state.fade});
  }

  onSliderChange(value){
    this.props.send("SPEED", this.toMsg(Math.round(value*255, 0)), null, true);
    this.setState({speed: value});
  }

  _renderItem(gradient, index) {
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
          <Display image={gradient.image} />
        </View>
      </TouchableHighlight>
    );
  }

  _renderList() {
    l = [];
    for(i = 0; i < gradients.length; i++){
      l.push(this._renderItem(gradients[i], i));
    }
    return (l);
  }

  _renderControlBar(){
    const {mode, selected} = this.props;
    console.log(selected);
    const sel = mode == 0 ? (selected[0] == selected[1] ? selected[0]: -1): selected[mode-1];
    const icon = [styles.icon, sel === -1 ? {opacity: 0.5} : null];

    return(
      <View style={styles.controlBar}>

        <TouchableOpacity
            disabled={sel === -1}
            style={styles.iconTouch }
            onPress={()=>this.onPlayPressed()}>
          <Icon source={this.state.play ? ic_pause : ic_play} size={32} style={icon}/>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconTouch}
            disabled={sel === -1}
            onPress={()=>this.onChangePressed()}>
          <Icon source={ic_change} size={32} style={icon}/>
        </TouchableOpacity>

        <Slider style={{flex: 2}}
          value={0.5}
          thumbTintColor={colors.blue}
          maximumTrackTintColor={colors.gray}
          minimumTrackTintColor={colors.lightgray}
          disabled={sel === -1}
          onValueChange={(speed) => this.onSliderChange(speed)} />
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
  headerText: {
    fontSize: 30,
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
