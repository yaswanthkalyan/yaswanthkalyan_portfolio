(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;

  function fitCanvas(canvas) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { context: context, width: width, height: height };
  }

  function initBackgroundNetwork() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    let scene = fitCanvas(canvas);
    let points = [];
    let frame;

    function createPoints() {
      points = [];
      const count = Math.min(42, Math.max(22, Math.floor(scene.width / 42)));
      for (let index = 0; index < count; index += 1) {
        points.push({
          x: Math.random() * scene.width,
          y: Math.random() * scene.height,
          radius: Math.random() * 1.5 + .5,
          speed: Math.random() * .18 + .06,
          direction: Math.random() > .5 ? 1 : -1,
          hue: index % 4 === 0 ? 285 : 170
        });
      }
    }

    function resize() {
      scene = fitCanvas(canvas);
      createPoints();
    }

    function draw(time) {
      const context = scene.context;
      context.clearRect(0, 0, scene.width, scene.height);
      context.lineWidth = .6;

      points.forEach(function (point, index) {
        if (!reducedMotion) {
          point.y += point.speed * point.direction;
          point.x += Math.sin(time * .00025 + index) * .04;
          if (point.y < -10 || point.y > scene.height + 10) point.direction *= -1;
        }
        context.fillStyle = 'hsla(' + point.hue + ', 90%, 72%, .55)';
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();

        for (let next = index + 1; next < points.length; next += 1) {
          const target = points[next];
          const dx = point.x - target.x;
          const dy = point.y - target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 155) {
            const opacity = (1 - distance / 155) * .12;
            context.strokeStyle = 'rgba(105, 247, 221, ' + opacity + ')';
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(target.x, target.y);
            context.stroke();
          }
        }
      });

      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    if (reducedMotion) draw(0);
    else frame = window.requestAnimationFrame(draw);

    window.addEventListener('pagehide', function () {
      if (frame) window.cancelAnimationFrame(frame);
    });
  }

  function initSystemMap() {
    const canvas = document.getElementById('system-map');
    if (!canvas) return;

    let scene = fitCanvas(canvas);
    let frame;
    let activeNode = 'core';
    const points = {
      data: { x: .16, y: .15, color: '#69f7dd', phase: 0 },
      research: { x: .15, y: .78, color: '#ffd36e', phase: .7 },
      model: { x: .84, y: .15, color: '#9c83ff', phase: 1.3 },
      agent: { x: .16, y: .49, color: '#9c83ff', phase: 1.8 },
      vision: { x: .84, y: .49, color: '#f47ec4', phase: 2.1 },
      bayesian: { x: .5, y: .88, color: '#ffd36e', phase: 2.5 },
      impact: { x: .79, y: .79, color: '#f47ec4', phase: 2.8 },
      core: { x: .5, y: .5, color: '#69f7dd', phase: 1.1 }
    };
    const edges = [
      { from: 'data', to: 'core', phase: 0 },
      { from: 'research', to: 'core', phase: .8 },
      { from: 'agent', to: 'core', phase: 1.3 },
      { from: 'core', to: 'model', phase: 1.9 },
      { from: 'core', to: 'vision', phase: 2.5 },
      { from: 'model', to: 'impact', phase: 3.2 },
      { from: 'vision', to: 'impact', phase: 3.8 },
      { from: 'core', to: 'bayesian', phase: 4.3 },
      { from: 'bayesian', to: 'impact', phase: 4.8 },
      { from: 'core', to: 'impact', phase: 5.4 },
      { from: 'model', to: 'agent', phase: 6 }
    ];
    const nodeDetails = {
      core: { kicker: 'SELECTED LAYER / CORE', title: 'AI / DATA SCIENCE SYSTEM', description: 'A connected practice: reliable data, rigorous research, intelligent models, and outcomes people can act on.', contribution: 'Connects signal, reasoning, and measurable action into one system.', stack: 'ML · GenAI · statistics · data engineering', value: '6+', measure: 'production + research systems', status: 'systems thinking' },
      data: { kicker: 'LAYER 01 / INPUT', title: 'DATA FOUNDATION', description: 'Operational telemetry, biomedical cohorts, language, imagery, financial records, and event data become usable through contracts, validation, and feature pipelines.', contribution: 'Makes messy evidence trustworthy enough to power production decisions.', stack: 'Python · SQL · GCP · feature pipelines', value: '80%', measure: 'manual reporting automated', status: 'signals in' },
      research: { kicker: 'LAYER 02 / EVIDENCE', title: 'RESEARCH DEPTH', description: 'Bayesian statistics, genomics, A/B testing, and reproducible analysis turn ambiguous questions into defensible evidence.', contribution: 'Reduces bias and makes analytical claims easier to reproduce and defend.', stack: 'Bayesian stats · GWAS · eQTL · multi-omics', value: '25%', measure: 'cohort bias reduced', status: 'evidence loaded' },
      model: { kicker: 'LAYER 03 / REASONING', title: 'MODEL INTELLIGENCE', description: 'Machine learning, transformers, GenAI, optimization, and time-series systems connect patterns to decisions.', contribution: 'Converts patterns in data into recommendations, forecasts, and operational choices.', stack: 'ML · NLP · recommenders · time series', value: '10–15%', measure: 'unplanned downtime reduced', status: 'reasoning active' },
      agent: { kicker: 'LAYER 04 / ACTION', title: 'AGENTIC AI + RAG', description: 'Secure LLM agents, schema reasoning, YouTube Q&A, and retrieval workflows make analysis and content creation interactive.', contribution: 'Turns natural-language questions into guided analysis, content, and next actions.', stack: 'Gemini · LangChain · Groq LLaMA · secure SQL', value: '50%', measure: 'analysis turnaround reduced', status: 'agents online' },
      vision: { kicker: 'LAYER 05 / PERCEPTION', title: 'COMPUTER VISION', description: 'U-Net, YOLO, and recognition systems translate pixels into crop intelligence, segmentation, and secure access decisions.', contribution: 'Turns images into measurable crop signals and tighter security workflows.', stack: 'U-Net · YOLO · segmentation · RFID', value: '97%', measure: 'leaf segmentation accuracy', status: 'perception online' },
      bayesian: { kicker: 'LAYER 06 / UNCERTAINTY', title: 'BAYESIAN DECISIONING', description: 'Bayesian A/B testing and MCMC portfolio simulations make risk, lift, and uncertainty visible before a decision is made.', contribution: 'Makes uncertainty explicit so experiments and investments can be managed with context.', stack: 'MCMC · A/B testing · simulation · predictive analytics', value: '2', measure: 'decision systems modeled', status: 'uncertainty quantified' },
      impact: { kicker: 'LAYER 07 / OUTCOME', title: 'BUSINESS IMPACT', description: 'Production analytics and AI systems connect model output to operational savings, faster workflows, and safer decisions.', contribution: 'Moves technical work from prototype to savings, speed, safety, and adoption.', stack: '$2M+ value · 80% automation · 30% HSE uplift', value: '$2M+', measure: 'annualized Tyson value', status: 'value out' }
    };

    const status = document.getElementById('graph-status');
    const metric = document.getElementById('graph-metric');
    const kicker = document.getElementById('graph-kicker');
    const title = document.getElementById('graph-title');
    const description = document.getElementById('graph-description');
    const contribution = document.getElementById('graph-contribution');
    const stack = document.getElementById('graph-stack');
    const value = document.getElementById('graph-value');
    const measure = document.getElementById('graph-measure');
    const domNodes = document.querySelectorAll('.neural-lab [data-node]');

    function selectNode(id) {
      const detail = nodeDetails[id] || nodeDetails.core;
      activeNode = id;
      domNodes.forEach(function (node) {
        const selected = node.dataset.node === id;
        node.classList.toggle('is-active', selected);
        node.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      if (status) status.textContent = detail.status;
      if (metric) metric.textContent = '08 nodes / 11 edges / active ' + id;
      if (kicker) kicker.textContent = detail.kicker;
      if (title) title.textContent = detail.title;
      if (description) description.textContent = detail.description;
      if (contribution) contribution.textContent = detail.contribution;
      if (stack) stack.textContent = detail.stack;
      if (value) value.innerHTML = detail.value.replace('+', '<span>+</span>');
      if (measure) measure.textContent = detail.measure;
    }

    function canvasPoint(id) {
      return { x: scene.width * points[id].x, y: scene.height * points[id].y };
    }

    function resize() { scene = fitCanvas(canvas); }

    function draw(time) {
      const context = scene.context;
      context.clearRect(0, 0, scene.width, scene.height);
      context.lineWidth = 1.1;

      edges.forEach(function (edge) {
        const start = canvasPoint(edge.from);
        const end = canvasPoint(edge.to);
        const related = edge.from === activeNode || edge.to === activeNode;
        context.strokeStyle = related ? 'rgba(105, 247, 221, .5)' : 'rgba(105, 247, 221, .14)';
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();

        const progress = reducedMotion ? .5 : ((time * .00012 + edge.phase * .08) % 1);
        const particleX = start.x + (end.x - start.x) * progress;
        const particleY = start.y + (end.y - start.y) * progress;
        context.fillStyle = related ? '#c7fff5' : 'rgba(105, 247, 221, .7)';
        context.shadowBlur = related ? 14 : 7;
        context.shadowColor = '#69f7dd';
        context.beginPath();
        context.arc(particleX, particleY, related ? 2.3 : 1.5, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      Object.keys(points).forEach(function (id) {
        const point = points[id];
        const location = canvasPoint(id);
        const pulse = reducedMotion ? 0 : Math.sin(time * .002 + point.phase) * 2;
        context.fillStyle = point.color;
        context.globalAlpha = id === activeNode ? 1 : .55;
        context.shadowBlur = id === activeNode ? 18 : 7;
        context.shadowColor = point.color;
        context.beginPath();
        context.arc(location.x, location.y, id === 'core' ? 5 + pulse : 2.5 + pulse * .35, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
        context.shadowBlur = 0;
      });
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    }

    domNodes.forEach(function (node) {
      node.addEventListener('click', function () { selectNode(node.dataset.node); });
      node.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectNode(node.dataset.node);
        }
      });
    });

    window.addEventListener('resize', resize, { passive: true });
    resize();
    selectNode('core');
    if (reducedMotion) draw(0);
    else frame = window.requestAnimationFrame(draw);
  }

  function initCursor() {
    if (reducedMotion || !finePointer) return;
    let frame;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    window.addEventListener('pointermove', function (event) {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        root.style.setProperty('--cursor-x', x + 'px');
        root.style.setProperty('--cursor-y', y + 'px');
        frame = null;
      });
    }, { passive: true });
  }

  function initTilt() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll('.tilt-card').forEach(function (card) {
      const strength = Number(card.dataset.tiltStrength || 4);
      card.addEventListener('pointermove', function (event) {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.transform = 'perspective(1100px) rotateX(' + (-y * strength).toFixed(2) + 'deg) rotateY(' + (x * strength).toFixed(2) + 'deg) translateY(-5px)';
        card.style.setProperty('--shine-x', ((x + .5) * 100).toFixed(0) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
        card.style.setProperty('--shine-x', '50%');
      });
    });
  }

  function initMagneticButtons() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll('.magnetic').forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * .13;
        const y = (event.clientY - bounds.top - bounds.height / 2) * .13;
        button.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
      });
      button.addEventListener('pointerleave', function () { button.style.transform = ''; });
    });
  }

  function initFilters() {
    const buttons = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.work-card');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const filter = button.dataset.filter;
        buttons.forEach(function (item) {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          const visible = filter === 'all' || card.dataset.category.split(' ').includes(filter);
          card.classList.toggle('is-hidden', !visible);
          card.setAttribute('aria-hidden', visible ? 'false' : 'true');
        });
      });
    });
  }

  function initNavigation() {
    const nav = document.querySelector('.site-nav');
    const menu = document.querySelector('.menu-toggle');
    const shell = document.querySelector('.nav-shell');
    const links = document.querySelectorAll('.nav-link');
    if (menu && nav) {
      menu.addEventListener('click', function () {
        const open = nav.classList.toggle('is-open');
        menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.forEach(function (link) { link.addEventListener('click', function () { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }); });
    }
    window.addEventListener('scroll', function () { if (shell) shell.classList.toggle('is-scrolled', window.scrollY > 30); }, { passive: true });
  }

  function initScrollState() {
    const meter = document.querySelector('.scroll-meter span');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');
    function updateMeter() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (meter) meter.style.width = (max > 0 ? window.scrollY / max : 0) * 100 + '%';
    }
    window.addEventListener('scroll', updateMeter, { passive: true });
    window.addEventListener('resize', updateMeter, { passive: true });
    updateMeter();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) { link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id); });
        });
      }, { rootMargin: '-42% 0px -48% 0px' });
      sections.forEach(function (section) { observer.observe(section); });
    }
  }

  function initYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  initBackgroundNetwork();
  initSystemMap();
  initCursor();
  initTilt();
  initMagneticButtons();
  initFilters();
  initNavigation();
  initScrollState();
  initYear();
}());
