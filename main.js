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

  // Safe browser-only terminal simulator: commands are illustrative and never executed by the OS.
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  if (terminalForm && terminalInput && terminalOutput) {
    const commands = {
      help: ['Available commands:', 'help     Show this help', 'about    About the project', 'modules  List planned research areas', 'status   Show project status', 'clear    Clear this demo terminal'],
      about: ['SANJU SECURITY OS', 'A Debian 13-based security and digital-forensics workstation concept.', 'This terminal is a simulated website demo.'],
      modules: ['CYBERSECURITY  | Authorized security learning and testing', 'FORENSICS      | Evidence and filesystem examination', 'RECOVERY       | Storage diagnostics and data restoration', 'SDR            | RF and signal research', 'VM             | Windows virtual-machine workflows', 'OFFLINE        | Offline-first lab design goal'],
      status: ['PROJECT: IN DEVELOPMENT', 'BASE: Debian 13 (Trixie) target', 'WEBSITE: Interactive demo mode', 'RELEASE: Check the main OS repository for verified releases']
    };
    terminalForm.addEventListener('submit', event => {
      event.preventDefault();
      const command = terminalInput.value.trim().toLowerCase();
      if (!command) return;
      const line = document.createElement('p');
      line.innerHTML = '<span class="term-prompt">sanju@security-os:~$</span> ';
      const safeCommand = document.createElement('span');
      safeCommand.className = 'term-command';
      safeCommand.textContent = command;
      line.appendChild(safeCommand);
      terminalOutput.appendChild(line);
      if (command === 'clear') {
        terminalOutput.innerHTML = '<p><span class="term-muted">Terminal cleared. Type help to see available demo commands.</span></p>';
      } else {
        const lines = commands[command] || ['Command not found. This is a limited simulator; type help.'];
        lines.forEach((item, index) => {
          const p = document.createElement('p');
          p.textContent = item;
          if (!commands[command]) p.className = 'term-error';
          else if (index === 0) p.className = 'term-success';
          terminalOutput.appendChild(p);
        });
      }
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      terminalInput.value = '';
    });
  }

  // Reveal-on-scroll and back-to-top controls.
  const revealTargets = document.querySelectorAll('.feature-card, .milestone, .lab-stat, .faq-list details, .spec-panel');
  revealTargets.forEach(node => node.classList.add('reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.12});
    revealTargets.forEach(node => observer.observe(node));
  } else revealTargets.forEach(node => node.classList.add('is-visible'));
  const topButton = document.getElementById('back-to-top');
  if (topButton) {
    const updateTopButton = () => topButton.classList.toggle('visible', window.scrollY > 500);
    window.addEventListener('scroll', updateTopButton, {passive:true});
    updateTopButton();
    topButton.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  }
\n})();