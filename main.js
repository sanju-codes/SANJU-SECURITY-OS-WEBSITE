(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.textContent = '☰';
    }));
  }
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const canvas = document.getElementById('core-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const points = [];
  const rings = 3;
  for (let r = 0; r < rings; r++) {
    const radius = 75 + r * 28;
    const count = 14 + r * 5;
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      points.push({x: Math.cos(a) * radius, y: Math.sin(a) * radius, z: (r - 1) * 42, ring:r});
    }
  }
  let angle = 0;
  function draw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 520, h = canvas.clientHeight || 520;
    if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) {
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, rot=angle;
    const projected = points.map(p => {
      const x=p.x*Math.cos(rot)-p.z*Math.sin(rot);
      const z=p.x*Math.sin(rot)+p.z*Math.cos(rot);
      const y=p.y*Math.cos(rot*.65)-z*Math.sin(rot*.65);
      const zz=p.y*Math.sin(rot*.65)+z*Math.cos(rot*.65);
      const scale=260/(260+zz);
      return {x:cx+x*scale,y:cy+y*scale,ring:p.ring};
    });
    ctx.lineWidth=1;
    for(let i=0;i<projected.length;i++){
      for(let j=i+1;j<projected.length;j++){
        const a=projected[i],b=projected[j],dist=Math.hypot(a.x-b.x,a.y-b.y);
        if(dist<67 && Math.abs(a.ring-b.ring)<2){
          ctx.strokeStyle='rgba(93,229,218,'+(0.18*(1-dist/67))+')';
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    projected.forEach((p,i)=>{
      ctx.fillStyle=i%5===0?'rgba(175,255,246,.95)':'rgba(93,229,218,.72)';
      ctx.beginPath();ctx.arc(p.x,p.y,i%5===0?3:1.7,0,Math.PI*2);ctx.fill();
    });
    ctx.strokeStyle='rgba(93,229,218,.45)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx,cy,42,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(93,229,218,.12)';ctx.beginPath();ctx.arc(cx,cy,34,0,Math.PI*2);ctx.fill();
    if(!reduced) angle+=0.0035;
    if(!reduced) requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',()=>{if(reduced)draw();},{passive:true});
})();