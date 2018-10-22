import React, {Component} from 'react';
import {Image, StyleSheet, Dimensions} from 'react-native';

const {colors} = require('./colors.json');
const screen = Dimensions.get('window');

export default class Display extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Image source={this.props.image} style={styles.main} resizeMode='stretch' resizeMethod='scale'/>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    height: 32+6,
    width: screen.width-20+6,
    marginVertical: 15,
    borderWidth: 3,
    borderColor: colors.bg,
  }
});
