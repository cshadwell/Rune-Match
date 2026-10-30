/* Fit 52 stable card positions into the available screen without tiny targets. */
(function(root){
  'use strict';
  function fit(width,height,count=52,gap=8,min=44){
    let best=null;
    for(let columns=3;columns<=Math.min(16,Math.floor((width+gap)/(min+gap)));columns++){
      const rows=Math.ceil(count/columns),w=(width-gap*(columns-1))/columns,h=(height-gap*(rows-1))/rows;
      if(w<min||h<min)continue;
      const score=Math.abs(Math.log(w/h))+(columns*rows-count)*.035;
      if(!best||score<best.score)best={columns,rows,height,score};
    }
    if(best)return best;
    const columns=Math.max(1,Math.min(8,Math.floor((width+gap)/64)));
    const rows=Math.ceil(count/columns);
    return {columns,rows,height:Math.max(height,rows*min+(rows-1)*gap)};
  }
  if(typeof module==='object'&&module.exports)module.exports={fit};
  else root.RuneLayout={fit};
})(typeof globalThis==='object'?globalThis:this);
