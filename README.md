# LED-Control

This is a project of mine for an App which is able to control a NeoPixel LED
strip through bluetooth connection and an Arduino (Nano).
The code is now fully functional and the updated version is now on the Google
Play store.

The program itself is able to control two separate LED strips. I would not
recommend to use more than 80 single LEDs per strip, otherwise the framerate
and possibly data loss over the serial connection could impair the good
experience.

## Hardware

To control your own LEDs you will first have to assemble the hardware
components. You will need
 - An Arduino, it basically doesn't matter which one, but I used the Nano
because it's compact form factor. You might have to adjust the pins in the
sketch
 - A bluetooth serial adapter (HC-05, HC-06). I used the HC-06 and cannot tell
anything about the HC-05.
 - Some kind of powersupply, keep in mind that for 12V LEDs, you will need an
extra 5V supply for the Arduino.

In the beginning you have to connect the devices in the following way: 

![breakboard](circuit_bb.png)
![schema](circuit_schem.png)
Idk why the Neopixels are so big in the Fritzing Library.

Let us first take care about the HC-06. When shipped, it has it's product
description as default name and 1234 as default Pin, you might want to change
this. I included a little sketch that can do exactly this. Simply set your name
and Pin in the definitions and upload it to the Arduino. When the program is
finished the red light on the Arduino will turn on. Note that the HC-06 won't
listen to AT commands, which are used to communicate with the HC-06 settings,
if it was booted up normally. To enter this developer mode, pull up (connect to
5V) the Key or EN pin during startup. When the red LED shows, you can also use
script whith an serial USB connection to send your own AT commands to the HC-06

__Note__: The name of your bluetooth device will also be used as the Title in
the mobile app. The app also provides some formatting of the Title, which is
triggered by a dash. So a name 'Led-Control' would show up in the app as
'__LED__ CONTROL'. All characters are also made uppercase.

## Mobile App

Unfortunately, I am not in the possession of a MacBook nor an iPhone, so the App
is currently only available for Android. But since ReactNative, the framework
of this app, is cross-platform it would be possible to also create an iOs
Version.

The app is pretty simple, if no BT device is connected it shows a dialog,
giving you the chance of selecting one of your paired devices. Select your BT
serial adapter and start choosing a color for the strip

There are three different kinds of modes:
- Color: Here you can choose one solid color for the complete LED strip. You
can use the color picker or 15 predefined colors.
- Gradient: Choose one of the currently 11 gradients to display along the
strip. You can also animate the offset of the gradient or animate through the
solid colors of the gradient.
- Animation: Currently there are 3 Animations you can pick: A confetti (kind
of), a moving and trailing point and a strobo flash. With sliders, you can
adjust some of the parameters.

With the button in the title bar you can swap between the led strips; there are
three possibilities '1+2', '1' and '2'.

# Dependencies used
Arduino sketch:
- ![AltSoftSerial](https://github.com/PaulStoffregen/AltSoftSerial "test")


