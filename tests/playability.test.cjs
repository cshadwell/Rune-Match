const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {Game,LETTERS,IDS,fresh,validate,GLYPH}=require('../engine.js');
const script=fs.readFileSync(require.resolve('../app.js'),'utf8');
const KEY='rune-match:save:v1';
const tick=()=>new Promise(r=>setImmediate(r));
class Element {
  constructor(doc){this.doc=doc;this.attrs={};this.dataset={};this.children=[];this.events={};this.classes=new Set();this.classList={toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};this.textContent='';this.open=false;this.isConnected=true;}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  fire(k){for(const fn of this.events[k]??[])fn({target:this});}
  append(e){this.children.push(e);}
  replaceChildren(){this.children=[];}
  focus(){this.doc.activeElement=this;}
  showModal(){this.open=true;}
  close(){this.open=false;this.fire('close');}
}
function makeLocks(){let tail=Promise.resolve();return {request(_name,fn){const job=tail.then(fn);tail=job.catch(()=>{});return job;}};}
function browser({store=new Map(),audio='missing',blocked=false,locks=null,confirm=true}={}) {
  const els={},events={},timers=new Map();let nextTimer=0;
  const doc={hidden:false,createElement:()=>new Element(doc),getElementById:id=>els[id]??=(new Element(doc)),addEventListener(k,fn){(events['doc:'+k]??=[]).push(fn);},fonts:{load:()=>Promise.resolve([{}])}};
  const localStorage={getItem(k){if(blocked)throw Error('blocked');return store.get(k)??null;},setItem(k,v){if(blocked)throw Error('blocked');store.set(k,v);}};
  const win={confirm:()=>confirm,addEventListener(k,fn){(events[k]??=[]).push(fn);}};
  if(audio!=='missing')win.AudioContext=function(){this.resume=()=>audio==='suspended'?new Promise(()=>{}):Promise.reject(Error('audio denied'));this.createOscillator=()=>{throw Error('audio device failed');};};
  const ctx={RuneArtwork:require("../rune-art.js"),RuneMatch:{Game,LETTERS,IDS,fresh,validate,GLYPH},document:doc,localStorage,navigator:locks?{locks}:{},window:win,setTimeout(fn){const id=++nextTimer;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),console};
  vm.createContext(ctx);vm.runInContext(script,ctx);
  const find=id=>els.grid.children.find(e=>e.dataset.id===id);
  return {els,store,doc,find,events,timers,async click(id){find(id).fire('click');await tick();},async control(id){els[id].fire('click');await tick();},settle(){for(const [id,fn] of timers){timers.delete(id);fn();}},saved:()=>JSON.parse(store.get(KEY)),async event(k,e={}){for(const fn of events[k]??[])fn(e);await tick();}};
}
test('fresh deck contains precisely two of every rune; saved decks retain order',()=>{const s=fresh();assert.equal(new Set(s.deck).size,52);for(const l of LETTERS)assert.equal(s.deck.filter(id=>id[0]===l).length,2);assert.deepEqual(validate(s),s);});
test('invalid/duplicate/incompatible saved data is rejected',()=>{for(const mutation of [s=>s.version=2,s=>s.moves=-1,s=>s.deck[0]=s.deck[1],s=>s.matched=['!'],s=>{s.matched=['A'];s.moves=0;},s=>s.matched=['A','A']]){const s=fresh();mutation(s);assert.throws(()=>validate(s));}});
test('rapid third card and repeated same card are rejected until settlement',()=>{const g=new Game();g.select('A-0');assert.equal(g.select('A-0').type,'ignored');g.select('B-0');assert.equal(g.select('C-0').type,'ignored');assert.equal(g.state.moves,1);g.settle();assert.equal(g.select('C-0').type,'first');});
test('match is durable immediately; reloaded state has no unresolved turn',()=>{const g=new Game();g.select('A-0');g.select('A-1');const r=new Game(g.snapshot());assert.deepEqual(r.state.matched,['A']);assert.deepEqual(r.open,[]);assert.equal(r.select('A-0').type,'ignored');});
test('all 26 letters can be completed and restored with exact cipher mappings',()=>{const g=new Game();for(const l of LETTERS){g.select(l+'-0');const result=g.select(l+'-1');assert.equal(result.type,'match');g.settle();}assert.equal(g.state.moves,26);assert.equal(new Game(g.snapshot()).state.matched.length,26);assert.equal(LETTERS.map(l=>GLYPH[l]).join(''),'ᛉᚦᛞᚸᛇᚾᛈᚢᛃᛟᚲᛏᚠᛜᚨᛠᛗᛣᛊᚷᛚᛁᛥᚺᛡᚫ');});
for(const audio of ['missing','suspended','rejected'])test('browser continues without usable audio: '+audio,async()=>{const b=browser({audio});await tick();await b.click('A-0');await b.click('A-1');b.settle();assert.equal(b.saved().game.moves,1);assert.deepEqual(b.saved().game.matched,['A']);assert.equal(b.els.matches.textContent,'1');});
test('browser fast clicks cannot overlap turns or produce extra timers',async()=>{const b=browser();await tick();b.find('A-0').fire('click');b.find('B-0').fire('click');b.find('C-0').fire('click');assert.equal(b.saved().game.moves,1);await tick();await b.click('C-0');assert.equal(b.saved().game.moves,1);assert.equal(b.timers.size,1);b.settle();assert.equal(b.find('A-0').classes.has('flipped'),false);assert.equal(b.find('B-0').classes.has('flipped'),false);});
test('reload mid-miss preserves moves and board; reload mid-match preserves letter',async()=>{const store=new Map();let b=browser({store});await tick();const deck=b.saved().game.deck;await b.click('A-0');await b.click('B-0');b=browser({store});await tick();assert.equal(b.saved().game.moves,1);assert.deepEqual(b.saved().game.deck,deck);assert.equal(b.find('A-0').classes.has('flipped'),false);await b.click('A-0');await b.click('A-1');b=browser({store});await tick();assert.equal(b.els.matches.textContent,'1');assert.equal(b.find('A-0').classes.has('matched'),true);});
test('completed cipher can close, reopen and survive revisit',async()=>{const store=new Map();const b=browser({store});await tick();for(const l of LETTERS){await b.click(l+'-0');await b.click(l+'-1');b.settle();}assert.equal(b.els.completeOverlay.open,true);await b.control('closeOverlay');assert.equal(b.els.completeOverlay.open,false);await b.control('viewCipher');assert.equal(b.els.fullKey.children.length,26);const r=browser({store});await tick();await r.control('viewCipher');assert.equal(r.els.fullKey.children.length,26);});
test('corrupt save is backed up and replaced with a valid playable game',async()=>{const store=new Map([[KEY,'broken json']]);const b=browser({store});await tick();assert.equal(store.get(KEY+':recovery'),'broken json');assert.equal(b.saved().game.moves,0);assert.match(b.els.saveStatus.textContent,/could not be read/);await b.click('A-0');await b.click('A-1');assert.equal(b.saved().game.matched.length,1);});
test('blocked storage allows play and reports persistence limitation',async()=>{const b=browser({blocked:true});await tick();await b.click('A-0');await b.click('A-1');b.settle();assert.equal(b.els.matches.textContent,'1');assert.match(b.els.saveStatus.textContent,/cannot be saved/);});
test('mute survives reload, reset cancellation preserves progress, confirmed reset cancels stale timer',async()=>{const b=browser();await tick();await b.control('mute');assert.equal(b.saved().muted,true);await b.click('A-0');await b.click('A-1');await b.control('startOver');b.settle();assert.equal(b.saved().game.moves,0);assert.equal(b.els.matches.textContent,'0');const r=browser({store:b.store,confirm:false});await tick();await r.click('B-0');await r.click('B-1');await r.control('startOver');assert.equal(r.saved().game.moves,1);});
test('newer tab wins: stale selection never overwrites saved matches',async()=>{const store=new Map(),locks=makeLocks();const a=browser({store,locks}),b=browser({store,locks});await tick();await tick();await a.click('A-0');await a.click('A-1');await b.click('B-0');assert.deepEqual(b.saved().game.matched,['A']);assert.match(b.els.feedback.textContent,/another tab/);await b.click('B-0');await b.click('B-1');assert.deepEqual(b.saved().game.matched,['A','B']);await a.event('storage',{key:KEY});assert.equal(a.els.matches.textContent,'2');});
test('concurrent first loads and turns are serialized across tabs',async()=>{const store=new Map(),locks=makeLocks();const a=browser({store,locks}),b=browser({store,locks});await tick();await tick();assert.deepEqual(a.els.grid.children.map(e=>e.dataset.id),b.els.grid.children.map(e=>e.dataset.id));await a.click('A-0');await b.click('B-0');a.find('A-1').fire('click');b.find('B-1').fire('click');await tick();await tick();assert.deepEqual(a.saved().game.matched,['A']);assert.equal(a.saved().game.moves,1);});
test('storage events invalidate pending callbacks; cleared saves reset safely',async()=>{const b=browser();await tick();await b.click('A-0');await b.click('B-0');b.store.delete(KEY);await b.event('storage',{key:KEY});assert.equal(b.timers.size,0);assert.equal(b.els.moves.textContent,'0');b.settle();});
test('hidden cards do not expose answer letters in their accessible label',async()=>{const b=browser();await tick();assert.match(b.find('A-0').attrs['aria-label'],/^Card \d+: hidden$/);await b.click('A-0');assert.match(b.find('A-0').attrs['aria-label'],/exposed rune ᛉ$/);});
test('all approved SVG paths and assignments are preserved exactly',()=>{
  const {ART,render}=require('../rune-art.js');
  const source=fs.readFileSync(require.resolve('../reference/Rune_Match_Alphabet_Key.svg'),'utf8');
  assert.deepEqual(Object.keys(ART),LETTERS);
  for(const l of LETTERS){
    const group=source.match(new RegExp('<g id="rune-'+l+'"[\\s\\S]*?<path[^>]+d="([^"]+)"'));
    assert.ok(group,l); assert.equal(ART[l].d,group[1]);assert.equal(ART[l].rune,GLYPH[l]);
    assert.ok(render(l).includes('d="'+group[1]+'"'));assert.ok(!render(l).includes('<text'));
  }
});
test('cards and both key displays use approved paths',async()=>{
 const b=browser();await tick();assert.ok(b.find('A-0').innerHTML.includes('<path'));
 await b.click('A-0');await b.click('A-1');b.settle();assert.ok(b.els.keyGrid.children[0].innerHTML.includes('<path'));
 await b.control('viewCipher');assert.ok(b.els.fullKey.children[0].innerHTML.includes('<path'));
});
