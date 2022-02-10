import { Component, OnInit } from '@angular/core';
import ADSREnvelope from "adsr-envelope";

@Component({
  selector: 'app-oscillator',
  templateUrl: './oscillator.component.html',
  styleUrls: ['./oscillator.component.css']
})
export class OscillatorComponent implements OnInit {

  harmonicsCount = 12;
  harmonicsArray = new Array(this.harmonicsCount);

  fundamentalFreq = 440;
  attackTime = 0.1;
  decayTime = 0.2;
  sustainTime = 0.1;
  releaseTime = 0.4;
  peakLevel = 0.9;
  sustainLevel = 0.5;

  constructor() { }

    ngOnInit(): void {
  }

  el(id):HTMLElement{
    return document.getElementById(id);
  }

  onStart(slidersContainer:HTMLElement){
    
    this.fundamentalFreq = parseInt((this.el("frequency") as HTMLInputElement).value);
    this.attackTime = parseFloat((this.el("attack") as HTMLInputElement).value);
    this.decayTime = parseFloat((this.el("decay") as HTMLInputElement).value);
    this.sustainTime = parseFloat((this.el("sustain") as HTMLInputElement).value);
    this.releaseTime = parseFloat((this.el("release") as HTMLInputElement).value);

    let sliders = new Array();

    let i = 1;

    for(let child of Array.from(slidersContainer.children)){
      sliders.push({harmonic: i++,value:child.getElementsByTagName("input")[0].value});
    }

    var real = new Float32Array(this.harmonicsCount + 1);
    var imag = new Float32Array(this.harmonicsCount + 1);
    var ac = new AudioContext();
    var osc = ac.createOscillator();
    
    real[0] = 0;
    imag[0] = 0;

    for(let item of sliders){
      real[item.harmonic] = item.value;
      imag[item.harmonic] = 0;
    }

    var wave = ac.createPeriodicWave(real, imag, {disableNormalization: true});
    
    osc.setPeriodicWave(wave);

    osc.frequency.value = this.fundamentalFreq;


    let gain = ac.createGain();

    let adsr = new ADSREnvelope({
      attackTime: this.attackTime,
      decayTime: this.decayTime,
      sustainTime: this.sustainTime,
      releaseTime: this.releaseTime,
      gateTime: this.attackTime + this.decayTime + this.sustainTime,
      releaseCurve: "lin",
      peakLevel:this.peakLevel,
      SustainLevel:this.sustainTime
    });

    adsr.applyTo(gain.gain, ac.currentTime);

    osc.connect(gain);
    gain.connect(ac.destination);
    


    // osc.start();
    // osc.stop(0.5);


    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + adsr.duration);

  }


}
