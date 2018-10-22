import React, {Component} from 'react';
import {Text, StyleSheet, View, Button, TouchableOpacity, AsyncStorage} from 'react-native';
import Modal from 'react-native-modal';

import BluetoothSerial from 'react-native-bluetooth-serial';
import Spinner from 'react-native-spinkit';


const Buffer = require('buffer').Buffer;

const ID = "20:16:03:10:10:59"
const INDEX = "@index:key"


const protocol = {
  "COLOR": Buffer.from('c'),
  "FADE": Buffer.from('f'),
  "ANIMATION": Buffer.from('a'),
  "GRADIENT": Buffer.from('g'),
  "SPEED": Buffer.from('s'),
  "MODE": Buffer.from('m'),
  "DEVICE": Buffer.from('d'),
  "OPT1": Buffer.from('o'),
  "OPT2": Buffer.from('p'),
};

export default class BluetoothModal extends Component{
  constructor(props){
    super(props);
    this.state={
      open: false,
      headerText: 'Bluetooth Connection',
      buttonText: 'Connect',

      isEnabled: false,
      connecting: false,
      connected: false,
      devices: [],
      index: 0,
      errMsg: '',

      outputLimit : 20,
      lastDate: null,
      lastCommand: "",
      lastMsg: ""
    };
  }

  componentWillMount(){
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values
      this.setState({ isEnabled, devices })
      return AsyncStorage.getItem(INDEX);
    }).then((value) => {
      console.log(value);
      try{
        const i = parseInt(value);
      }catch(e){
        const i = 0;
      }
      if(i < this.state.devices.length){
        this.setState({index: i});
      }
    }).catch((e) => console.log("this", e));

    BluetoothSerial.on('bluetoothEnabled', () => {
      console.log('Bluetooth enabled');
      this.setState({isEnabled : true});
      BluetoothSerial.list().then((devices) => {
        this.setState({devices});
        return AsyncStorage.getItem(INDEX);
      }).then((value) => {
        const i = parseInt(value);
        if(value < this.state.devices.length){
          this.setState({index: i});
        }
      });
    });
    BluetoothSerial.on('bluetoothDisabled', () => {
      console.log('Bluetooth disabled');
      this.setState({isEnabled : false, devices: []});
    });
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`));
    BluetoothSerial.on('connectionLost', () => {
      this.props.onDeviceName("Led-Control");
      if (this.state.device) {
        console.log(`Connection to device ${this.state.device.name} has been lost`);
      }
      this.setState({ connected: false })
    });
    if(!this.props.dummy){
      this.checkInterval = setInterval(()=>{
        if(!this.state.connected && !this.state.open){
          this.openModal();
        }
      }, 500);
    }
    this.setState({lastDate: new Date()})
  }

  componentWillUnmount(){
    if(this.state.connected) this.disconnect();
    clearInterval(this.checkInterval);
  }

  connect (device) {
    this.setState({ connecting: true });
    BluetoothSerial.connect(device.id)
    .then((res) => {
      console.log(`Connected to device ${device.name}`);
      this.setState({ device, connected: true, connecting: false, open: false, errMsg: '' });
      this.props.onDeviceName(device.name);
      //BluetoothSerial.write("cFF0000").then((res)=>{console.log("success")}).catch((err)=>{console.log(err)});
    })
    .catch((err) => {console.log(err.message);
    this.setState({ connecting: false,
      headerText: 'Bluetooth Connection',
      buttonText: 'Connect',
      errMsg: err.message});}
    );
  }

  disconnect(){
    BluetoothSerial.disconnect()
    .then(() => {
      this.setState({ connected: false });
      this.props.onDeviceName("Led-Control");
    }).catch((err) => console.log(err.message));
  }

  send(command, msg, cont){
    var d = new Date();
    /*if((!(command == this.lastCommand && msg == this.lastMsg) &&*/
    if(this.state.outputLimit == 0 || d-this.state.lastDate > this.state.outputLimit){
      if (this.state.connected){
        var buf = Buffer.concat([protocol[command], Buffer.from(msg, 'hex')]);
        var c = 0;
        for(i = 0; i < buf.length; i++){
          c+=buf[i];
        }
        buf = Buffer.concat([buf, Buffer.from([c%256])]);
        BluetoothSerial.write(buf);
        setTimeout(() => BluetoothSerial.write(buf), this.state.outputLimit/5);
        if(cont){
          setTimeout(() => BluetoothSerial.write(buf), 2*this.state.outputLimit/5);
          setTimeout(() => BluetoothSerial.write(buf), 3*this.state.outputLimit/5);
        }
      } else{
        console.log(command, msg);
      }
      this.setState({
        lastDate : d,
        lastCommand : command,
        lastMsg: msg
      });
    }
  }

  onButton(){
    if(!this.state.connecting){
      console.log(this.state.index);
      this.connect(this.state.devices[this.state.index]);
      AsyncStorage.setItem(INDEX, this.state.index.toString());
      this.setState({
        headerText: 'Connecting ...',
        buttonText: 'ABORT'
      });
    }else{
      this.disconnect();
    }
  }

  openModal(){
    this.setState({
      headerText: 'Bluetooth Connection',
      buttonText: 'CONNECT',
      errMsg: '',
      open: true,
    });
  }

  closeModal(){
    this.setState({
      open: false,
    })
  }

  render(){
    return(
      <Modal
          isVisible={this.state.open}
          animationIn={'fadeInUp'}
          animationOut={'fadeOutDown'}
          backdropOpacity={0.5}
          hideOnBack={false}
          onModalHide={()=>this.setState({open: false})}>
        <View style={styles.container}>
          <Text style={styles.header}>{this.state.headerText}</Text>


          {this.createContent()}


	  <View style={styles.footer}>
	    <View />
	    <View style={{minWidth: 100}}>
	      <Button
		title={this.state.buttonText}
		onPress={() => this.onButton()}
		disabled={this.state.devices.length == 0} />
	    </View>
          </View>
        </View>
      </Modal>
      );
  }

  createContent(){
    if(!this.state.connecting){
      return(
        <View style={styles.content}>
          <Text style={styles.contentText}>Bluetooth enabled: {this.state.isEnabled ? "Yes" : "No"}</Text>
          {this.deviceChooser()}
          {this.hints()}
        </View>
      );
    }else{
      return(
        <View style={styles.content}>
          <Spinner type={"ThreeBounce"} size={75} color={"#2196F3"}/>
        </View>
      );
    }
  }

  deviceChooser(){
    //return(null);
    if(this.state.devices.length > 0){
      return(
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.contentText}>Choose device: </Text>
        <TouchableOpacity onPress={()=>{this.setState({index: (this.state.index+1)%this.state.devices.length});console.log(this.state.index);}}>
          <Text style={[styles.contentText, {fontWeight: 'bold'}]}>{this.state.devices[this.state.index].name}</Text>
        </TouchableOpacity>
      </View>
      );
    }else{
      return(<Text style={styles.contentText}>No devices found.</Text>);
    }
  }

  hints(){
    if(!this.state.isEnabled){
      return(<Text style={styles.hintText}>Please enable Bluetooth.</Text>);
    }else if(this.state.devices.length == 0){
      return(<Text style={styles.hintText}>Make sure device is paired.</Text>);
    }else if(this.state.errMsg != ''){
      return(<Text style={[styles.hintText, {color: '#DA2A1F'}]}>{this.state.errMsg}</Text>);
    }
    return null;
  }
}



const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    padding: 15,
    borderRadius: 4,
  },
  header:{
    fontSize: 24,
    color: '#404B4F',
    textAlign: 'center',
  },
  content:{
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:15,
  },
  contentText:{
    fontSize: 16,
    color: '#404B4F',
    fontFamily: "sans-serif",
  },
  hintText:{
    fontSize: 14,
    color: '#808B8F',
    fontStyle: 'italic'
  },
  footer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  }
});
