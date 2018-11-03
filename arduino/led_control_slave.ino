
#include<FastLED.h>
#include<SoftwareSerial.h>

#define NUM_LEDS_1   23
#define NUM_LEDS_2   23

#define DATA_PIN_1   2
#define DATA_PIN_2   3

#define COLOR        0
#define GRADIENT     1
#define ANIMATION    2
#define FADE         3

#define DEV_A        0
#define DEV_1        1
#define DEV_2        2

#define NUM_PALETTES 7

DEFINE_GRADIENT_PALETTE( RedOrangeColors_gp ) {0, 255, 89, 0,  64, 255, 183, 0,  128, 255, 17, 0,  191, 255, 183, 0,  255, 237, 38, 3,  };
DEFINE_GRADIENT_PALETTE( BlueGreenColors_gp ) {0, 0, 255, 102,  10, 0, 255, 102,  64, 0, 166, 255,  128, 0, 255, 191,  191, 0, 123, 255,  245, 5, 235, 78,  255, 5, 235, 78,  };
DEFINE_GRADIENT_PALETTE( MagentaColors_gp ) {0, 221, 0, 255,  10, 221, 0, 255,  64, 89, 0, 255,  128, 255, 0, 72,  191, 102, 0, 255,  245, 235, 7, 201,  255, 235, 7, 201,  };

class LED{
  private:
    /*const CRGBPalette16 p = RainbowColors_p;
    const CRGBPalette16 palettes[] = {p};//, PartyColors_p, CloudColors_p, LavaColors_p, OceanColors_p, ForestColors_p, HeatColors_p};*/
    CRGB *leds;
    byte num;
    CRGB dest = CRGB::White;
    CRGB current = CRGB::Black;
    byte state = FADE;
    byte op = 0;
    byte m = 0;
    float phi = 0;
    float phi2 = 0;
    float lastphi = 0;
    short cyc = 0;
    bool active = true;

    float sp = 1;
    float opt1 = 1;
    float opt2 = 1;
    
  public:
    LED(CRGB *_leds, byte _num){
      leds = _leds;
      num = _num;
    }

    void setColor(CRGB color){
      if(!active) return;
      current = color;
      state = COLOR;
    }

    void setGradient(byte _op){
      if(!active) return;
      phi = lastphi = 0;
      op = _op;
      state = GRADIENT;
    }

    void setAnimation(byte _op){
      if(!active) return;
      phi = 0;
      op = _op;
      state = ANIMATION; 
    }

    void setFade(CRGB color){
      if(!active) return;
      if(state != FADE && state != COLOR){
        setColor(color);
        return;
      }
      if(state == FADE){
        current = blend(current, dest, cyc);
      }
      cyc = 0;
      dest = color;
      state = FADE;
    }

    void setActive(bool a){
      active = a;
    }

    void setMode(byte _m){
      if(!active) return;
      m = _m;
    }

    void setSpeed(byte _sp){
      if(!active) return;
      sp = getFloatSp(_sp);
    }

    void setOpt1(byte _sp){
      if(!active) return;
      opt1 = getFloatSp(_sp);
    }

    void setOpt2(byte _sp){
      if(!active) return;
      if(state == ANIMATION && op == 1){
        
      }
      opt2 = getFloatSp(_sp);
    }

    float getFloatSp(byte sp){
      return pow(((float)sp/(127.0)), 2);
    }


    bool loop_1(){ 
      bool ret = false;
      if(state == COLOR){
        fill_solid(leds, num, current);
      }
      else if(state == GRADIENT){
        gradient();
      }
      else if(state == ANIMATION){
        ret = animation();
      }
      else if(state == FADE){
        fade();
      }
      lastphi = phi;
      phi += sp;
      if(phi > 255){
        phi -= 255;
      }
      phi2 += 0.1+opt2/3.0;
      if(phi2 > 255){
        phi2 -= 255;
      }
      //Serial.println(state);
      return ret;
    }

    void gradient(){
      float d = 0;
      for(int i = 0; i < num; i++){
        if(m == 0){
          phi = lastphi;
          d = (255.0/num*i)-phi;
        }else if(m == 1){
          d = (255.0/num*i)-phi;
        }else if(m == 2){
          d = phi;
        }else if(m == 3){
          phi = lastphi;
          d = phi;
        }
        leds[i] = ColorFromPalette(getPalette(op), d, 255);
      }
    }
    
    void fade() {
      if(cyc < 255){
        fill_solid(leds, num, blend(current, dest, cyc));
        cyc+=20;
      }else{
        setColor(dest);
      }
    }
    
    bool animation(){
      switch(op){
        case 0:
          confetti();
          break;
        case 1:
          sinelon();
          break;
        case 2:
          strobe(6);
          return true;
        default:
          setColor(CRGB::Black);
      }
      return false;
    }

    void strobe(float dur){
      if(phi > dur){
        phi = 0;
        fill_solid(leds, num, CRGB::White);
      }
    }

    void closeLoop(){
      if(state==ANIMATION && op==2)fill_solid(leds, num, CRGB::Black);
    }

    void confetti() {
      fadeToBlackBy( leds, num, opt1*10);
      int pos = random16(num);
      leds[pos] += CHSV((random8(opt2*32)+(int)phi), 255, 255);
      
    }

    void sinelon() {
      fadeToBlackBy( leds, num, opt1*10);
      int pos = (int)((sin(phi2*2*PI/255)+1)/2.0*num);
      leds[pos] += CHSV( phi, 255, 192);
    }


    CRGBPalette16 getPalette(byte i){
      switch(i){
        case 0: return (CRGBPalette16) RainbowColors_p;
        case 1: return (CRGBPalette16) PartyColors_p;
        case 2: return (CRGBPalette16) RedOrangeColors_gp;
        case 3: return (CRGBPalette16) BlueGreenColors_gp;
        case 4: return (CRGBPalette16) MagentaColors_gp;
        case 5: return (CRGBPalette16) CloudColors_p;
        case 6: return (CRGBPalette16) ForestColors_p;
        case 7: return (CRGBPalette16) HeatColors_p;
        case 8: return (CRGBPalette16) LavaColors_p;
        case 9: return (CRGBPalette16) OceanColors_p;
        case 10: return (CRGBPalette16) RainbowStripeColors_p;
        
        default: return (CRGBPalette16)RainbowColors_p;
      }
    }

};

CRGB leds1[NUM_LEDS_1];
CRGB leds2[NUM_LEDS_2];

unsigned long t;
long s = 0;
short c = 0;

CRGB readCol;

/* SoftwareSerial Serial(5, 4); */

LED *strip1;
LED *strip2;

void setup() {
  FastLED.addLeds<WS2812B, DATA_PIN_1, RGB>(leds1, NUM_LEDS_1);//.setCorrection( 0xAFFFC0 );
  FastLED.addLeds<WS2812B, DATA_PIN_2, RGB>(leds2, NUM_LEDS_2);

  strip1 = new LED(leds1, NUM_LEDS_1);
  strip2 = new LED(leds2, NUM_LEDS_2);
  
  FastLED.show();

  /* Serial.begin(9600); */
  Serial.begin(9600);  
  t = micros();
}

byte readByte(){
  byte c = 0;
  while(!Serial.available()){
    delayMicroseconds(500);
    c++;
    if(c > 100){
      return 0;
    }
  }
  return Serial.read();
}

CRGB readColor(){
  byte r = readByte();
  byte g = readByte();
  byte b = readByte();
  return CRGB(r, g, b);
}

void handleInput(){
  char c = Serial.read();
  /* Serial.println(c); */
  if(c == 'c'){
    CRGB c = readColor();
    byte check = readByte();
    if(check == ('c'+c.r+c.g+c.b)%256){
      strip1->setColor(c);
      strip2->setColor(c);
    }      
  }else if(c == 'g'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('g'+n)%256){
      strip1->setGradient(n);
      strip2->setGradient(n);
    }
  }else if(c == 'a'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('a'+n)%256){
      strip1->setAnimation(n);
      strip2->setAnimation(n);
    }
  }else if(c == 'f'){
    CRGB c = readColor();
    byte check = readByte();
    if(check == ('f'+c.r+c.g+c.b)%256){
      strip1->setFade(c);
      strip2->setFade(c);
    }
  }else if(c == 'd'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('d'+n)%256){
      if(n == 0){
        strip1->setActive(true);
        strip2->setActive(true);
      }else if(n == 1){
        strip1->setActive(true);
        strip2->setActive(false);
      }else if(n == 2){
        strip1->setActive(false);
        strip2->setActive(true);
      }
    }
  }else if(c == 'm'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('m'+n)%256){
      strip1->setMode(n);
      strip2->setMode(n);
    }
  }else if(c == 's'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('s'+n)%256){
      strip1->setSpeed(n);
      strip2->setSpeed(n);
    }
  }else if(c == 'o'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('o'+n)%256){
      strip1->setOpt1(n);
      strip2->setOpt1(n);
    }
  }else if(c == 'p'){
    byte n = readByte();
    byte check = readByte();
    if(check == ('p'+n)%256){
      strip1->setOpt2(n);
      strip2->setOpt2(n);
    }
  }
}


void fps() {
  int dt1 = micros()-t;
  int wait = (16666-dt1)/1000;
  if(wait > 0) delay(wait);
  //delay(10);
  s+=micros()-t;
  if(c == 0){
    /* Serial.println(100000000/s); */
    s = 0;
  }
  c++;
  c%=100;
  t = micros();
}

void loop() {
  while(Serial.available()){
    handleInput();
    /* Serial.println("handleInput"); */
  }
  bool a = strip1->loop_1();
  bool b = strip2->loop_1();
  if(a||b){
    FastLED.show();
    strip1->closeLoop();
    strip2->closeLoop();
  }
  FastLED.show();
  fps();
}
