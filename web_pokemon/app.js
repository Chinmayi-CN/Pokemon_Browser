
const API_BASE = 'https://pokeapi.co/api/v2/pokemon';
const LIMIT = 20;
let offset = 0;

const dropToggle = document.getElementById('dropToggle');
const dropMenu = document.getElementById('dropMenu');
const hideItemsToggle = document.getElementById('hideItemsToggle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageLabel = document.getElementById('pageLabel');
const listRoot = document.getElementById('pokemonList');
const detailsInner = document.getElementById('detailsInner');


dropToggle.addEventListener('click', () => {
  const showing = dropMenu.classList.toggle('show');
  dropToggle.setAttribute('aria-expanded', showing ? 'true' : 'false');
});

document.addEventListener('click', (e) => {
  if (!document.getElementById('dropdownRoot').contains(e.target)) {
    dropMenu.classList.remove('show');
    dropToggle.setAttribute('aria-expanded', 'false');
  }
});


hideItemsToggle.addEventListener('change', (e) => {
  const hide = e.target.checked;
  if (hide) {
    if (!dropMenu.dataset.savedHtml) dropMenu.dataset.savedHtml = dropMenu.innerHTML;
    dropMenu.innerHTML = '<div class="drop-item muted" style="padding:12px">Menu items hidden</div>';
  } else {
    if (dropMenu.dataset.savedHtml) {
      dropMenu.innerHTML = dropMenu.dataset.savedHtml;
      delete dropMenu.dataset.savedHtml;
    }
  }
});


async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    detailsInner.innerHTML = '<div style="color:#b91c1c">Error: ' + err.message + '</div>';
    return null;
  }
}

async function loadList() {
  listRoot.innerHTML = '<div class="muted" style="padding:18px">Loading Pokémon…</div>';
  const url = `${API_BASE}?limit=${LIMIT}&offset=${offset}`;
  const data = await fetchJson(url);
  if (!data) return;

  listRoot.innerHTML = '';
  data.results.forEach(p => {
    const card = document.createElement('div');
    card.className = 'poke-card';

    const thumb = document.createElement('div');
    thumb.className = 'poke-thumb';
    thumb.textContent = p.name.slice(0, 2).toUpperCase();

    const meta = document.createElement('div');
    meta.style.flex = '1';

    const name = document.createElement('div');
    name.className = 'poke-name';
    name.textContent = p.name;

    const btnRow = document.createElement('div');
    btnRow.style.marginTop = '8px';

    const view = document.createElement('button');
    view.className = 'view-btn small';
    view.textContent = 'View Details';
    view.onclick = () => loadDetails(p.url);

    btnRow.appendChild(view);
    meta.appendChild(name);
    meta.appendChild(btnRow);

    card.appendChild(thumb);
    card.appendChild(meta);
    listRoot.appendChild(card);
  });

  prevBtn.disabled = !data.previous;
  nextBtn.disabled = !data.next;
  pageLabel.textContent = 'Page ' + (Math.floor(offset / LIMIT) + 1);
}

async function loadDetails(url) {
  detailsInner.innerHTML = '<div class="muted">Loading details…</div>';
  const data = await fetchJson(url);
  if (!data) return;

  const sprite = data.sprites && (data.sprites.front_default || data.sprites.other?.['official-artwork']?.front_default);

  detailsInner.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="sprite">
        ${sprite ? `<img src="${sprite}" alt="${data.name}" style="width:120px;height:120px">` : '<div class="small muted">No image</div>'}
      </div>
      <h4 style="margin:0;text-transform:capitalize">${data.name}</h4>
      <div class="meta" style="margin-top:8px">
        <div class="chip">ID: ${data.id}</div>
        <div class="chip">Weight: ${data.weight}</div>
        <div class="chip">Height: ${data.height}</div>
        <div class="chip">Types: ${data.types.map(t => t.type.name).join(', ')}</div>
      </div>
      <div style="margin-top:12px;width:100%;display:flex;gap:8px;justify-content:center">
        <button class="view-btn" onclick="scrollToList()">Back to list</button>
      </div>
    </div>
  `;
}

function scrollToList() {
  window.scrollTo({ top: document.querySelector('.panel').offsetTop - 20, behavior: 'smooth' });
}

prevBtn.addEventListener('click', () => {
  if (offset === 0) return;
  offset = Math.max(0, offset - LIMIT);
  loadList();
});

nextBtn.addEventListener('click', () => {
  offset += LIMIT;
  loadList();
});

/* initial load */
loadList();
