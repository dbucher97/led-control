import React, {Component} from 'react';
import {Animated, Image, View} from 'react-native';

export default class Icon extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Image style={[this.props.style, {width:this.props.size, height: this.props.size}]}
        source={this.props.source} resizeMode='contain' resizeMethod='scale'/>
    );
  }
}
