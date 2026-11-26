(() => {
  const sampleSize = 74;
  const cache = new Map();
  const near = [-sampleSize, 1-sampleSize, 1, 1+sampleSize, sampleSize, sampleSize-1, -1, -sampleSize-1];

  function thin(pixels) {
    let changed;
    do {
      changed = false;
      for (const pass of [0,1]) {
        const remove = [];
        for (let i=sampleSize+1;i<pixels.length-sampleSize-1;i++) {
          if (!pixels[i]) continue;
          const p = near.map(offset => pixels[i+offset]);
          const count = p.reduce((sum, value) => sum+value, 0);
          const turns = p.filter((value, index) => !value && p[(index+1)%8]).length;
          if (count<2 || count>6 || turns!==1) continue;
          if (pass ? p[0]*p[2]*p[6] || p[0]*p[4]*p[6] : p[0]*p[2]*p[4] || p[2]*p[4]*p[6]) continue;
          remove.push(i);
        }
        for (const i of remove) pixels[i]=0;
        changed ||= remove.length>0;
      }
    } while (changed);
  }

  function centerline(font, character) {
    const key=font+'|'+character;
    if (cache.has(key)) return cache.get(key);
    const mask=document.createElement('canvas');
    mask.width=mask.height=sampleSize;
    const ctx=mask.getContext('2d',{willReadFrequently:true});
    ctx.font=font;
    ctx.textBaseline='alphabetic';
    ctx.fillText(character,5,56);
    const data=ctx.getImageData(0,0,sampleSize,sampleSize).data;
    const pixels=Uint8Array.from({length:sampleSize*sampleSize},(_,i)=>Number(data[i*4+3]>75));
    thin(pixels);
    const remaining=new Set();
    for(let i=0;i<pixels.length;i++) if(pixels[i])remaining.add(i);
    const route=[];
    while(remaining.size){
      // Start at a terminal pixel where possible and follow a connected stroke.
      let point=[...remaining].find(i=>near.filter(offset=>remaining.has(i+offset)).length<=1) ?? remaining.values().next().value;
      let connected=false;
      while(point!==undefined){
        route.push([point%sampleSize,Math.floor(point/sampleSize),connected]);
        remaining.delete(point);
        point=near.map(offset=>point+offset).find(i=>remaining.has(i));
        connected=true;
      }
    }
    // Thin a small sample to find the pen route, but clip it with native-resolution type.
    const sharpMask=document.createElement('canvas');
    sharpMask.width=sharpMask.height=sampleSize*4;
    const sharpContext=sharpMask.getContext('2d');
    sharpContext.scale(4,4);
    sharpContext.font=font;
    sharpContext.textBaseline='alphabetic';
    sharpContext.fillText(character,5,56);
    const result={mask:sharpMask,route};
    cache.set(key,result);
    return result;
  }

  const surfaces=new WeakMap();
  function prepare(element) {
    const style=getComputedStyle(element);
    const font=style.fontWeight+' 50px '+style.fontFamily;
    const art=centerline(font,element.textContent);
    if (!art.route.length) return;
    const canvas=document.createElement('canvas');
    canvas.setAttribute('aria-hidden','true');
    const size=parseFloat(style.fontSize);
    const unit=size/50;
    const ratio=Math.max(2, window.devicePixelRatio || 1);
    canvas.width=canvas.height=Math.ceil(sampleSize*unit*ratio);
    canvas.style.width=sampleSize*unit+'px';
    canvas.style.height=sampleSize*unit+'px';
    canvas.style.left=-5*unit+'px';
    const metrics=canvas.getContext('2d');
    metrics.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;
    const baseline=metrics.measureText(element.textContent);
    canvas.style.top=((element.offsetHeight-baseline.fontBoundingBoxAscent-baseline.fontBoundingBoxDescent)/2+baseline.fontBoundingBoxAscent-56*unit)+'px';
    element.append(canvas);
    surfaces.set(element,{canvas,art,unit,viewport:innerWidth});
  }

  window.traceDirection = (element, progress) => {
    const running=progress>0&&progress<1;
    element.style.color=progress>=1?'':'transparent';
    let surface=surfaces.get(element);
    if(running&&(!surface||surface.viewport!==innerWidth)){
      surface?.canvas.remove();
      prepare(element);
      surface=surfaces.get(element);
    }
    if(!surface)return;
    surface.canvas.hidden=!running;
    if(!running)return;
    const {canvas,art}=surface;
    const ctx=canvas.getContext('2d');
    const density=canvas.width/sampleSize;
    ctx.setTransform(density,0,0,density,0,0);
    ctx.globalCompositeOperation='source-over';
    ctx.clearRect(0,0,sampleSize,sampleSize);
    ctx.fillStyle='#f8f6f2';
    ctx.strokeStyle='#f8f6f2';
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.lineWidth=5+Math.pow(progress,4)*15;
    const end=Math.max(1,Math.ceil(art.route.length*progress));
    ctx.beginPath();
    for(let i=0;i<end;i++){
      const [x,y,connected]=art.route[i];
      if(connected){
        const [previousX,previousY]=art.route[i-1];
        if(i===end-1)ctx.lineTo(x,y);
        else ctx.quadraticCurveTo(previousX,previousY,(previousX+x)/2,(previousY+y)/2);
      }
      else {ctx.moveTo(x,y);ctx.lineTo(x+.05,y);}
    }
    ctx.stroke();
    ctx.globalCompositeOperation='destination-in';
    ctx.drawImage(art.mask,0,0,sampleSize,sampleSize);
  };
})();
