/* State rules shared by the browser and regression tests. */
(function (root) {
  'use strict';
  const GLYPH = Object.freeze({A:'ᛉ',B:'ᚦ',C:'ᛞ',D:'ᚸ',E:'ᛇ',F:'ᚾ',G:'ᛈ',H:'ᚢ',I:'ᛃ',J:'ᛟ',K:'ᚲ',L:'ᛏ',M:'ᚠ',N:'ᛜ',O:'ᚨ',P:'ᛠ',Q:'ᛗ',R:'ᛣ',S:'ᛊ',T:'ᚷ',U:'ᛚ',V:'ᛁ',W:'ᛥ',X:'ᚺ',Y:'ᛡ',Z:'ᚫ'});
  const LETTERS = Object.keys(GLYPH);
  const IDS = LETTERS.flatMap(l => [l+'-0',l+'-1']);
  const VERSION = 1;
  function fresh(random = Math.random) {
    const deck = [...IDS];
    for (let i=deck.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    return {version:VERSION,deck,matched:[],moves:0};
  }
  function validate(s) {
    if (!s || s.version!==VERSION || !Array.isArray(s.deck) || s.deck.length!==52 || new Set(s.deck).size!==52 || s.deck.some(id=>!IDS.includes(id)) || !Array.isArray(s.matched) || new Set(s.matched).size!==s.matched.length || s.matched.some(l=>!LETTERS.includes(l)) || !Number.isSafeInteger(s.moves) || s.moves<s.matched.length) throw new Error('Invalid or incompatible save');
    return {version:VERSION,deck:[...s.deck],matched:LETTERS.filter(l=>s.matched.includes(l)),moves:s.moves};
  }
  class Game {
    constructor(saved=fresh()) { this.state=validate(saved); this.open=[]; }
    snapshot() { return validate(this.state); }
    select(id) {
      if (!this.state.deck.includes(id) || this.open.length===2 || this.open.includes(id) || this.state.matched.includes(id[0]) || this.state.moves===Number.MAX_SAFE_INTEGER) return {type:'ignored'};
      this.open.push(id);
      if (this.open.length===1) return {type:'first'};
      this.state.moves++;
      const letter=id[0];
      const match=this.open[0][0]===letter;
      if (match) this.state.matched=LETTERS.filter(l=>l===letter || this.state.matched.includes(l));
      return {type:match?'match':'miss',letter,complete:this.state.matched.length===26};
    }
    settle() { this.open=[]; }
  }
  const api={GLYPH,LETTERS,IDS,VERSION,fresh,validate,Game};
  if (typeof module==='object' && module.exports) module.exports=api;
  else root.RuneMatch=api;
})(typeof globalThis==='object' ? globalThis : this);
