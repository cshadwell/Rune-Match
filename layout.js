/* Fit stable card positions while preserving the supplied tile's aspect ratio. */
(function(root){
  'use strict';
  function fit(width,height,count=52,gap=8,min=44,aspect=1){
    const minWidth=min*Math.max(1,aspect),minHeight=min*Math.max(1,1/aspect);
    function dimensions(columns,rows,areaHeight){
      const w=(width-gap*(columns-1))/columns,h=(areaHeight-gap*(rows-1))/rows;
      const tileWidth=Math.min(w,h*aspect);
      return {columns,rows,height:areaHeight,tileWidth,tileHeight:tileWidth/aspect};
    }
    let best=null;
    for(let columns=3;columns<=Math.min(16,Math.floor((width+gap)/(minWidth+gap)));columns++){
      const rows=Math.ceil(count/columns),w=(width-gap*(columns-1))/columns,h=(height-gap*(rows-1))/rows;
      if(w<minWidth||h<minHeight)continue;
      const score=Math.abs(Math.log((w/h)/aspect))+(columns*rows-count)*.035;
      if(!best||score<best.score)best={...dimensions(columns,rows,height),score};
    }
    if(best)return best;
    const columns=Math.max(1,Math.min(16,Math.floor((width+gap)/(minWidth+gap))));
    const rows=Math.ceil(count/columns);
    return dimensions(columns,rows,Math.max(height,rows*minHeight+(rows-1)*gap));
  }
  if(typeof module==='object'&&module.exports)module.exports={fit};
  else root.RuneLayout={fit};
})(typeof globalThis==='object'?globalThis:this);
