import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Button,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { TabViewAnimated, TabBar } from 'react-native-tab-view';

import Footer from './footer';
import Icon from './icon';
import Gradients from './gradients';
import Colors from './colors';
import Animations from './animations';
import BluetoothModal from './bluetooth-modal';

const ic_close = require('./icons/close.png');
const ic_swap = [require('./icons/swap_0.png'), require('./icons/swap_1.png'), require('./icons/swap_2.png')];

const {colors} = require('./colors.json');


export default class Main extends Component {
  constructor(props){
    super(props)
    this.state = {
      index: 0,
      routes: [
        { key: '1', title: 'Color' },
        { key: '2', title: 'Gradient' },
        { key: '3', title: 'Animation' }
      ],
      surface :0,
      lastSelected: 0,
      title: "LED-Control",
      colorSelected: [{h: 0, s: 0, v: 1}, {h: 0, s: 0, v: 1}],
      gradientSelected: [-1, -1],
      animationSelected: [-1, -1],

      statcolor: colors.darkgray+'30',
      statstyle: 'dark-content',
    };
  }

  toMsg(i){
    var s = i.toString(16);
    if(s.length === 1) return '0'+s;
    return s;
  }

  onSurfacePress(){
    this.send("DEVICE", this.toMsg((this.state.surface+1)%3), null, true);
    return this.setState({
      surface: (this.state.surface+1)%3,
    });
  }

  send = (cmd, msg, selected, cont) => {
    this.refs.btmodal.send(cmd, msg, cont);
    var newColorSelected = this.state.colorSelected.slice(0);
    var newGradientSelected = this.state.gradientSelected.slice(0);
    var newAnimationSelected = this.state.animationSelected.slice(0);
    if(cmd === "COLOR" || cmd === "FADE"){
      if(this.state.surface == 0 || this.state.surface == 1){
        newColorSelected[0] = selected;
        newGradientSelected[0] = -1;
        newAnimationSelected[0] = -1;
      }
      if(this.state.surface == 0 || this.state.surface == 2){
        newColorSelected[1] = selected;
        newGradientSelected[1] = -1;
        newAnimationSelected[1] = -1;
      }
    }else if(cmd === "GRADIENT"){
      if(this.state.surface == 0 || this.state.surface == 1){
        newColorSelected[0] = -1;
        newGradientSelected[0] = selected;
        newAnimationSelected[0] = -1;
      }
      if(this.state.surface == 0 || this.state.surface == 2){
        newColorSelected[1] = -1;
        newGradientSelected[1] = selected;
        newAnimationSelected[1] = -1;
      }
    }else if(cmd === "ANIMATION"){
      if(this.state.surface == 0 || this.state.surface == 1){
        newColorSelected[0] = -1;
        newGradientSelected[0] = -1;
        newAnimationSelected[0] = selected;
      }
      if(this.state.surface == 0 || this.state.surface == 2){
        newColorSelected[1] = -1;
        newGradientSelected[1] = -1;
        newAnimationSelected[1] = selected;
      }
    }
    this.setState({
      colorSelected: newColorSelected,
      gradientSelected: newGradientSelected,
      animationSelected: newAnimationSelected,
    });
  }

  _handleChangeTab = (index) => {
    this.setState({ index });
  };

  _renderFooter = (props) => {
    return <Footer {...props} />;
  };

  _renderScene = ({ route }) => {
    switch (route.key) {
      case '1':
        return <Colors send={this.send} selected={this.state.colorSelected} mode={this.state.surface}/>;
      case '2':
        return <Gradients send={this.send} selected={this.state.gradientSelected} mode={this.state.surface}/>;
      case '3':
        return <Animations send={this.send} selected={this.state.animationSelected} mode={this.state.surface}/>;
      default:
        return null;
    }
  };


  render() {
    return (
      <View style={styles.container}>

        <StatusBar
            backgroundColor={this.state.statcolor}
            barStyle={this.state.statstyle}
            translucent={true}
            animated={true} />
        <View style={{height: StatusBar.currentHeight}}/>

        <BluetoothModal ref={"btmodal"} dummy={false}
          onDeviceName={(title) => this.setState({title})}/>

        <View style={styles.toolBar}>
          <Text
            style={[styles.barText, {fontWeight: "bold"}]}>
            {this.state.title.split("-")[0].toUpperCase()}
          </Text>
          <Text
            style={styles.barText}>
            {this.state.title.split("-")[1].toUpperCase()}
          </Text>
          <View style={{flex:1}} />
          <TouchableOpacity onPress={()=>this.onSurfacePress()}>
            <Icon source={ic_swap[this.state.surface]} size={32} style={styles.icon}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>this.refs.btmodal.disconnect()}>
            <Icon source={ic_close} size={32} style={styles.icon}/>
          </TouchableOpacity>
        </View>

        <TabViewAnimated
          style={styles.container}
          navigationState={this.state}
          renderScene={this._renderScene}
          renderFooter={this._renderFooter}
          onRequestChangeTab={this._handleChangeTab}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barText: {
    fontSize: 28,
    fontWeight: "100",
    color: colors.icons,
  },
  toolBar: {
    flexDirection: 'row',
    height: 56,
    padding: 6,
    paddingHorizontal: 14,
    borderColor: colors.gray,
    borderBottomWidth: 0.8,
    alignItems: 'center',
  },
  icon: {
    tintColor: colors.icon,
    marginLeft: 20,
  }
});
