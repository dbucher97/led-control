import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Text,
  Button,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

import { TabView, TabBar, SceneMap } from 'react-native-tab-view';

// import Footer from './footer2';
import Icon from './icon';
import Gradients from './gradients';
import Colors from './colors';
import Animations from './animations';
import BluetoothModal from './bluetooth-modal';

const ic_close = require('./icons/close.png');
const ic_swap = [require('./icons/swap_0.png'), require('./icons/swap_1.png'), require('./icons/swap_2.png')];
const ic_tab = [require('./icons/color.png'), require('./icons/gradient.png'), require('./icons/animation.png')];

const {colors} = require('./colors.json');



export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      index: 0,
      routes: [
	{ key: 'color', title: 'Color' },
	{ key: 'gradient', title: 'Gradient' },
	{ key: 'animation', title: 'Animation' },
      ],
      surface: 0,
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
    } else if(cmd === "ANIMATION"){
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
    // console.log(this.state);
    // console.log(newColorSelected, newGradientSelected, newAnimationSelected);
    this.setState({
      colorSelected: newColorSelected,
      gradientSelected: newGradientSelected,
      animationSelected: newAnimationSelected,
    });
  }

  _renderScene = props => {
    switch(props.route.key){
      case 'color':
	return <Colors send={this.send} selected={this.state.colorSelected} mode={this.state.surface}/>;
      case 'gradient':
	return <Gradients send={this.send} selected={this.state.gradientSelected} mode={this.state.surface}/>;
      case 'animation':
	return <Animations send={this.send} selected={this.state.animationSelected} mode={this.state.surface}/>;
    }
  }

  _renderFooter = props => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
	{props.navigationState.routes.map((route, i) => {
	  const color = props.position.interpolate({
	    inputRange,
	    outputRange: inputRange.map(
	      inputIndex => (inputIndex === i ? colors.blue : colors.icon)
	      ),
	  });
	  const opacity = props.position.interpolate({
	    inputRange,
	    outputRange: inputRange.map(
	      inputIndex => (inputIndex === i ? 1 : 0.5)
	      ),
	  });
	  const icon = ic_tab[i]
	  return (
	    <TouchableOpacity
	      style={styles.tabItem}
	      onPress={() => this.setState({ index: i })}>
	      <Animated.Image source={icon} style={[styles.tabIcon, {tintColor: color, opacity: opacity}]} />
	    </TouchableOpacity>
	  );
	})}
      </View>
    );
  };

 render () {
    return (
      <View style={styles.container}>

	<StatusBar
	  backgroundColor={this.state.statcolor}
	  barStyle={this.state.statstyle}
	  translucent={true}
	  animated={true} />
	<View style={{ height: StatusBar.currentHeight }} />

	<BluetoothModal ref={"btmodal"} dummy={false} 
	  onDeviceName={(title) => this.setState({title})} />
	
	<View style={styles.toolBar}>
	  <Text style={[{ fontWeight: 'bold' }, styles.barText]}>
	    {this.state.title.split("-")[0].toUpperCase()}
	  </Text>
	  <Text style={styles.barText}>
	    {this.state.title.split("-")[1].toUpperCase()}
	  </Text>

	  <View style={{flex:1 }} />
	  <TouchableOpacity onPress={()=>this.onSurfacePress()}>
	    <Icon source={ic_swap[this.state.surface]} size={32} 
	      style={styles.icon} />
	  </TouchableOpacity>

	  <TouchableOpacity onPress={()=>this.refs.btmodal.disconnect()}>
	    <Icon source={ic_close} size={32} style={styles.icon} />
	  </TouchableOpacity>
	</View>
	<TabView
	  navigationState={this.state}
	  renderScene={this._renderScene}
	  onIndexChange={index => this.setState({ index })}
	  initialLayout={Dimensions.get('window')}
	  renderTabBar={this._renderFooter}
	  tabBarPosition={'bottom'}
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
    color: colors.icons,
    fontFamily: 'sans-serif'
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.8,
    borderTopColor: colors.gray
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
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
  },
  tabIcon: {
    width: 32,
    height: 32,
    tintColor: colors.icon,
    opacity: 0.5
  }
});
