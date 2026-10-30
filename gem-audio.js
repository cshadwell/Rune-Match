/* Each press gets its own source: notes overlap, including repeated colors. */
(function(root){
  'use strict';
  const COLORS=['blue','green','purple','yellow','red'];
  function create({context,fetchAudio,onError=()=>{}}){
    const buffers=new Map(),voices=new Set();let muted=false,generation=0;
    function load(color){
      if(!buffers.has(color)) {
        const promise=fetchAudio(`assets/gem-audio/${color}.wav`)
          .then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();})
          .then(data=>context.decodeAudioData(data));
        buffers.set(color,promise);
        promise.catch(()=>{if(buffers.get(color)===promise)buffers.delete(color);});
      }
      return buffers.get(color);
    }
    function preload(){for(const color of COLORS)load(color).catch(()=>{});}
    function setMuted(value){
      muted=value;generation++;
      if(muted)for(const voice of voices){try{voice.stop();}catch{}}
      if(muted)voices.clear();
    }
    async function play(color){
      if(muted||!COLORS.includes(color))return false;
      const pressGeneration=generation;
      try {
        // Resume directly in the gesture, before any network/decode await.
        const resumed=context.resume();
        const [buffer]=await Promise.all([load(color),resumed]);
        if(muted||pressGeneration!==generation)return false;
        const source=context.createBufferSource();source.buffer=buffer;
        source.connect(context.destination);voices.add(source);
        source.onended=()=>{voices.delete(source);source.disconnect();};
        source.start();return true;
      }catch{onError(color);return false;}
    }
    return {preload,play,setMuted};
  }
  if(typeof module==='object'&&module.exports)module.exports={create,COLORS};
  else root.GemAudio={create,COLORS};
})(typeof globalThis==='object'?globalThis:this);
