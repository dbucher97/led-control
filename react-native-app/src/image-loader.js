let instance;

export default class ImageLoader{
  constructor(){
    if(!instance){
      this.gradients = [
        {"image": require("./gradients/RainbowColors.png")},
        {"image": require("./gradients/PartyColors.png")},
        {"image": require("./gradients/RedOrangeColors.png")},
        {"image": require("./gradients/BlueGreenColors.png")},
        {"image": require("./gradients/MagentaColors.png")},
        {"image": require("./gradients/CloudColors.png")},
        {"image": require("./gradients/ForestColors.png")},
        {"image": require("./gradients/HeatColors.png")},
        {"image": require("./gradients/LavaColors.png")},
        {"image": require("./gradients/OceanColors.png")},
        {"image": require("./gradients/RainbowStripeColors.png")},
      ]

      this.animations = [
        {"image": require("./gradients/ConfettiAnimation.png"), "opts": 3},
        {"image": require("./gradients/SinelonAnimation.png"), "opts": 3},
        {"image": require("./gradients/StrobeAnimation.png"), "opts": 1},
      ]

      instance = this;
    }
    return instance;
  }
}
