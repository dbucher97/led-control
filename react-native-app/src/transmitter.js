import React, {Component} from 'react';

import { Button } from 'react-native'
import BluetoothSerial from 'react-native-bluetooth-serial';

const Buffer = require('buffer').Buffer;

const ID = "20:16:03:10:10:59"

const protocol = {
  "COLOR": Buffer.from('c')
};

export default class Transmitter extends Component{

  constructor(props){
    super(props);
    this.state = {
      isEnabled: false,
      connecting: false,
      connected: false,
      devices: [],

      outputLimit : 20,
      lastDate: null,
      lastCommand: "",
      lastMsg: ""
    }
  }

  componentWillMount(){
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values
      this.setState({ isEnabled, devices })
    });

    BluetoothSerial.on('bluetoothEnabled', () => {
      console.log('Bluetooth enabled');
      this.setState({isEnabled : true});
      BluetoothSerial.list().then((devices) => this.setState({devices}));
    });
    BluetoothSerial.on('bluetoothDisabled', () => {
      console.log('Bluetooth disabled');
      this.setState({isEnabled : false});
    });
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`));
    BluetoothSerial.on('connectionLost', () => {
      if (this.state.device) {
        console.log(`Connection to device ${this.state.device.name} has been lost`)
      }
      this.setState({ connected: false })
    });

    this.setState({lastDate: new Date()})
  }

  componentWillUnmount(){
    if(this.state.connected) this.disconnect();
  }

  connect (device) {
    this.setState({ connecting: true });
    BluetoothSerial.connect(device.id)
    .then((res) => {
      console.log(`Connected to device ${device.name}`);
      this.setState({ device, connected: true, connecting: false });
      //BluetoothSerial.write("cFF0000").then((res)=>{console.log("success")}).catch((err)=>{console.log(err)});
    })
    .catch((err) => {console.log(err.message);
    this.setState({ connecting: false });}
    );
  }

  disconnectBT(){
    BluetoothSerial.disconnect()
    .then(() => this.setState({ connected: false }))
    .catch((err) => console.log(err.message));
  }

  scanBT(){
    console.log("Scanning BT ... //TODO");
  }

  connectBT(){
    console.log("Connecting BT ... //TODO");
  }

  send(command, msg){
    var d = new Date();
    /*if((!(command == this.lastCommand && msg == this.lastMsg) &&*/
    if(this.state.outputLimit == 0 || d-this.state.lastDate > this.state.outputLimit){
      if (this.state.connected){
        var buf = Buffer.concat([protocol[command], Buffer.from(msg, 'hex')]);
        var c = 0;
        for(i = 0; i < buf.length; i++){
          c+=buf[i];
        }
        console.log(c%256)
        buf = Buffer.concat([buf, Buffer.from([c%256])]);
        BluetoothSerial.write(buf);
	//setTimeout(() => BluetoothSerial.write(buf), outputLimit/5);
      }
      this.setState({
        lastDate : d,
        lastCommand : command,
        lastMsg: msg
      });
    }
  }

  isConnected(){
    return this.connected;
  }

  isConnecting(){
    return this.connecting;
  }

  test(){
    this.connecting = !this.connecting;
  }

  util_rgb2hexstr(r, g, b){
    return r.toString(16)+g.toString(16)+b.toString(16);
  }

  render(){
    return(<Button title={"DISCONNECT"} onPress={()=>this.disconnectBT()}/>);
  }
}
