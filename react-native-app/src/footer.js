import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native'

import Icon from './icon';

const ic = [require('./icons/color.png'), require('./icons/gradient.png'), require('./icons/animation.png')];
const {colors} = require('./colors.json');

export default class Footer extends Component{
  constructor(props){
    super(props);
    this.state = {
      items: props.navigationState.routes.length,
      was: 0,
      goes: 0,
      index: 0,
      clicked: false,
      opa: 0.2,
    };
  }

  componentWillMount(){
    this.props.subscribe('position', this._adjustScroll);
    this._adjustScroll(0);
  }

  _adjustScroll = (index) => {
    if(this.state.clicked && index===this.state.goes){
      this.setState({clicked: false});
    }
    this.setState({index});
  }

  _getOpacities(index){
    l = [];
    for(i = 0; i < this.state.items; i++){
        l.push(this.state.opa);
    }

    if(this.state.clicked){
      x = (index-this.state.was)/(this.state.goes-this.state.was);
      if(x === 1){
        l[index] = 1;
      }else{
        l[this.state.was] = 1-(1-this.state.opa)*x;
        l[this.state.goes] = this.state.opa+(1-this.state.opa)*x;
      }
    }else{
      var x = index%1;
      if(x === 0){
        l[index] = 1;
      }else{
        var a = Math.floor(index);
        var b = Math.ceil(index);
        l[a] = 1-(1-this.state.opa)*x;
        l[b] = this.state.opa+(1-this.state.opa)*x;
      }
    }
    return l;
  }

  _fromString(a){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  _componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  _blendColors(a, b, amount){
    a = this._fromString(a);
    b = this._fromString(b);
    var r = Math.round((1-amount)*a.r+amount*b.r, 0);
    var g = Math.round((1-amount)*a.g+amount*b.g, 0);
    var b = Math.round((1-amount)*a.b+amount*b.b, 0);
    return "rgb(" + r + ',' +  g + ',' +  b + ')';
  }

  _getTints(opacities){
    var l = [];
    for(i = 0; i < opacities.length; i++){
      l.push(this._blendColors(colors.blue, colors.icon, 1-(opacities[i]-this.state.opa)/(1-this.state.opa)));
    }
    return l;
  }

  render(){
    const routes = this.props.navigationState.routes;
    return(
      <View style={styles.contaier}>
        {this._renderRoutes(routes)}
      </View>
    );
  }

  _renderRoutes(routes){
    const opacities = this._getOpacities(this.state.index);
    const tints = this._getTints(opacities);
    l = [];
    for(i = 0; i < routes.length; i++){
      let x = i;
      l.push(this._renderRoute(opacities[x], tints[x], x));
    }
    return l;
  }

  _renderRoute(opacity, tint, index){
    const  style = {opacity: opacity, tintColor: tint};
    return(
      <View key={index} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity
            onPress={()=>{
              this.setState({clicked: true, goes: index, was: this.state.index});
              this.props.jumpToIndex(index)}
            }>
          <Icon source={ic[index]} style={[style, styles.icon]} size={32}/>
        </TouchableOpacity>
      </ View>
    );
  }
}

const styles = StyleSheet.create({
  contaier: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.8,
    borderColor: colors.gray,
  },
  icon: {
    marginHorizontal: 10,
  }
});
