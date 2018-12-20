#include <AltSoftSerial.h>

#define NAME 	"YOUR-NAME"
#define PIN	"PIN" //4 digits.
#define WAIT	1000
AltSoftSerial btSerial;

bool commandRecording = false;
String command = "";

void setup() {
	Serial.begin(9600);
	btSerial.begin(9600);
	delay(WAIT);
	Serial.print("AT+NAME = ");
	Serial.print(NAME);
	Serial.print(": ");
	sendCommand("AT+NAME", NAME);
	Serial.print("AT+PIN = ");
	Serial.print(PIN);
	Serial.print(": ");
	sendCommand("AT+PIN", PIN);
	digitalWrite(13, HIGH);
}

void recieve() {
	delay(WAIT);
	while(btSerial.available()) {
		Serial.write(btSerial.read());
		delay(3);
	}
	Serial.write("\n\r");
}

void sendCommand(char *cmd, char *arg) {
	btSerial.print(cmd);
	btSerial.print(arg);
	recieve();
}

void sendCommand(char *cmd) {
	btSerial.print(cmd);
	recieve();
}

void sendCommand(String cmd) {
	btSerial.print(cmd);
	recieve();
}

void loop() {
	if(!commandRecording) {
		Serial.print("ATCommand> ");
		commandRecording = true;
	} else {
		while(Serial.available()) {
			char c = (char) Serial.read();	
			Serial.write(c);
			if(c == '\r') {
				Serial.write('\n');
				sendCommand(command);
				command = "";
				commandRecording = false;
				while(Serial.available()) {
					Serial.read();
				}
			} else {
				command += c;
			}
		}
	}
}
