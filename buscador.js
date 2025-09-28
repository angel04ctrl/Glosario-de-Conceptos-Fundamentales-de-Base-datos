
/* buscador_embedded.js - versión embebida que no usa fetch, usa SEARCH_INDEX variable */
(() => {
  const input = document.getElementById('glossary-search');
  const results = document.getElementById('search-results');
  let index = [];
  let ready = false;

  function normalize(s){
    return s ? s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '';
  }

  try{
    // SEARCH_INDEX is injected below as a JSON array
    index = (typeof SEARCH_INDEX !== 'undefined') ? SEARCH_INDEX.map(item => ({...item, _key: normalize(item.title + ' ' + item.topic + ' ' + item.snippet)})) : [];
    ready = true;
  }catch(e){ console.error('Index parse error', e); }

  function showList(list){
    if(!results) return;
    results.innerHTML = '';
    if(!list.length){ results.style.display = 'none'; return; }
    results.style.display = 'block';
    list.forEach(it => {
      const div = document.createElement('div');
      div.className = 'result-item';
      div.tabIndex = 0;
      div.innerHTML = `<div><strong>${it.title}</strong></div><div class="result-meta">${it.topic} — ${it.snippet}</div>`;
      div.addEventListener('click', ()=> goTo(it));
      div.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') goTo(it); });
      results.appendChild(div);
    });
  }

  function goTo(it){
    try{ window.location.href = it.page + '#' + it.id; }catch(e){ console.error(e); }
    results.style.display = 'none';
  }

  function search(q){
    if(!ready) return;
    q = normalize(q.trim());
    if(!q){ results.style.display='none'; return; }
    const parts = q.split(/\s+/);
    const matched = index.filter(item => parts.every(p => item._key.includes(p))).slice(0,50);
    showList(matched);
  }

  function debounce(fn, ms=180){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), ms); }; }

  const deb = debounce((e)=> search(e.target.value), 150);

  if(input){
    input.addEventListener('input', deb);
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){ results.style.display='none'; input.blur(); }
      if(e.key === 'Enter'){ const first = results && results.querySelector('.result-item'); if(first){ first.click(); return; }
        const q = input.value.trim().toLowerCase();
        const exact = index.find(it => it.title.toLowerCase() === q || (it.title + ' ' + it.topic).toLowerCase() === q);
        if(exact) goTo(exact);
      }
    });
    document.addEventListener('click', (ev)=>{ if(!ev.target.closest || !ev.target.closest('#search-results') && ev.target !== input) results.style.display='none'; });
  }
  window.Glosario = { search };
})();
