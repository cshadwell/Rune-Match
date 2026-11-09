const {test}=require('node:test');
const assert=require('node:assert/strict');
const {create,COLORS}=require('../gem-audio.js');
function setup({fail=false}={}){
 const fetched=[],sources=[];
 const context={destination:{},resume:()=>Promise.resolve(),decodeAudioData:async b=>b,createBufferSource(){const s={connect(){},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;}};sources.push(s);return s;}};
 const errors=[];
 const player=create({context,fetchAudio:async url=>{fetched.push(url);return {ok:!fail,arrayBuffer:async()=>url};},onError:c=>errors.push(c)});
 return {player,fetched,sources,errors};
}
test('all five colors load their matching WAV; repeated and different notes overlap',async()=>{
 const b=setup();b.player.preload();
 await Promise.all(['blue','red','blue','green','purple','yellow'].map(c=>b.player.play(c)));
 assert.equal(b.fetched.length,5);assert.equal(b.sources.length,6);
 assert.ok(b.sources.every(s=>s.started&&!s.stopped));
 assert.equal(b.sources[0].buffer,'assets/gem-audio/blue.wav');
 assert.deepEqual(new Set(b.fetched),new Set(COLORS.map(c=>'assets/gem-audio/'+c+'.wav')));
});
test('muting stops active notes and prevents new ones; unmuting allows playback',async()=>{
 const b=setup();await b.player.play('red');b.player.setMuted(true);
 assert.equal(b.sources[0].stopped,true);assert.equal(await b.player.play('blue'),false);
 b.player.setMuted(false);await b.player.play('blue');assert.equal(b.sources.length,2);
});
test('a note still loading cannot sound after mute and unmute',async()=>{
 const b=setup();const pending=b.player.play('purple');b.player.setMuted(true);b.player.setMuted(false);
 assert.equal(await pending,false);assert.equal(b.sources.length,0);
});
test('failed audio reports failure and can be retried without throwing',async()=>{
 const b=setup({fail:true});assert.equal(await b.player.play('yellow'),false);assert.equal(await b.player.play('yellow'),false);
 assert.deepEqual(b.errors,['yellow','yellow']);assert.equal(b.fetched.length,2);
});

test('completion callback waits for the individual recording to end',async()=>{
 const b=setup();let completed=0;
 await b.player.play('purple',{onEnded:()=>completed++});
 assert.equal(completed,0);assert.equal(b.sources[0].started,true);
 b.sources[0].onended();assert.equal(completed,1);
});
test('muted and failed playback both release a waiting transition',async()=>{
 const muted=setup();muted.player.setMuted(true);let completed=0;
 await muted.player.play('purple',{onEnded:()=>completed++});
 const failed=setup({fail:true});await failed.player.play('purple',{onEnded:()=>completed++});
 assert.equal(completed,2);
});
