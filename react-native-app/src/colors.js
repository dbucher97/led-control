import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar
} from 'react-native';

import { TriangleColorPicker, fromHsv, toHsv } from 'react-native-color-picker';

const screen = Dimensions.get('window');

class Out extends Component{
  render(){
    return(<View style={styles.colorRow}>{this.props.pads}</View>);
  }
}

export default class Colors extends Component{
  constructor(props){
    super(props);
    this.state = {
      color: toHsv('white'),
      presets: [],
      active: true,
    }
  }

  componentWillMount(){
    var l = [];
    for(i = 0; i < 360; i+=(360/24)){
      l.push(fromHsv({h: i, s : 1, v:1}));
    }
    this.setState({
      presets: l
    });
  }

  componentWillUpdate(nextProps, nextState){
    if(nextProps.mode !== this.props.mode || nextProps.selected != this.props.selected){
      if(nextProps.mode == 0){
        if(nextProps.selected[1] === nextProps.selected[0] && nextProps.selected[0] !== -1){
          this.setState({color: nextProps.selected[0], active: true});
        }else{
          this.setState({active: false});
        }
      }else{
        if(nextProps.selected[nextProps.mode-1] !== -1){
          this.setState({color: nextProps.selected[nextProps.mode-1], active: true});
        }else{
          this.setState({active: false});
        }
      }
    }
  }

  colorClicked(i){
    this.props.send("FADE", this.state.presets[i].replace('#', ''), toHsv(this.state.presets[i]), true);
  }

  colorUpdated(a){
    this.props.send("COLOR", fromHsv(a).replace('#', ''), a);
  }

  _renderColorPresets(){
    const n = 3;
    const r = Math.ceil(this.state.presets.length/n);
    var l = [];
    var ll = [];
    for(i = 0; i < n; i++){
      for(j = 0; j < r; j++){
        let x = r*i+j;
        l.push(<TouchableOpacity key={this.state.presets[r*i+j]}
          style={[styles.colorPad, {backgroundColor: this.state.presets[r*i+j]}]}
          onPress={()=>this.colorClicked(x)}/>);
      }
      ll.push(<Out key={i} pads={l}/>);
      l = [];
    }
    return ll;
  }

  render(){
    return(
      <View style={styles.container}>
        <TriangleColorPicker
          ref={"picker"}
          style={styles.colorPicker}
          active={this.state.active}
          color={this.state.color}
          yoffset={64+StatusBar.currentHeight}
          onColorChange={(a)=>this.colorUpdated(a)}/>

        <View style={styles.colorPresets}>
          {this._renderColorPresets()}
        </View>
      </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  headerText: {
    fontSize: 30,
  },
  colorPicker: {
    height: screen.width-20,
    marginVertical: 8
  },
  colorPresets: {
    flex: 1,
  },
  colorRow:{
    flex: 1,
    flexDirection: 'row'
  },
  colorPad:{
    flex: 1
  },
});
