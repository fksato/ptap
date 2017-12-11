class SoundPlayerClass{ 
  constructor(){
    // todo: feed in explicit filepaths here and load; 
    // write playSound(filename)
    
      this.num_redundant_buffers = 8; // because sounds do not get played if requested to be played before they are over from a previous call 

      this.sound_filepaths = {
      'reward_sound':'sounds/chime.wav', // chime
      'punish_sound':'sounds/bad_doot.wav', // punish sound
      'blip':'sounds/frog.wav'}

      this.sound_objects = {}
      this.current_sound_counter = 0

      this.is_built = false
}

  async build(){
    for (var k in this.sound_filepaths){
      if(this.sound_filepaths.hasOwnProperty(k)){
        this.sound_objects[k] = []
        for (var j = 0; j<this.num_redundant_buffers; j++){
          var audio = new Audio(this.sound_filepaths[k])
          audio.volume=0.15; //set boost pedal to 5% volume          
          this.sound_objects[k].push(audio)
        }
      }
    }
    this.is_built = true
    return 
  }

  async playSound(name){
    if(this.is_built == false){
      await this.build()
    }
    if (!(name in this.sound_filepaths)){
      return 
    }

    this.sound_objects[name][this.current_sound_counter].play() 
    this.current_sound_counter = (this.current_sound_counter+1) % this.num_redundant_buffers
    return 
  }
}



