const state = {
  page: 1,
  pageSize: 6,
  campus: '',
  category: '',
  q: ''
};

// ---------- Carrossel de destaques ----------
async function loadFeatured() {
  const res = await fetch('/api/news/featured');
  const items = await res.json();

  const indicators = document.getElementById('carouselIndicators');
  const inner = document.getElementById('carouselInner');
  indicators.innerHTML = '';
  inner.innerHTML = '';

  items.forEach((n, idx) => {
    indicators.insertAdjacentHTML('beforeend', `
      <button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${idx}" ${idx===0?'class="active" aria-current="true"':''} aria-label="Slide ${idx+1}"></button>
    `);
    inner.insertAdjacentHTML('beforeend', `
      <div class="carousel-item ${idx===0?'active':''}">
        <img src="${n.imageUrl || 'https://picsum.photos/1200/500'}" class="d-block w-100" alt="${n.title}">
        <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
          <h5>${n.title}</h5>
          <p>${n.summary}</p>
        </div>
      </div>
    `);
  });
}

// ---------- Notícias ----------
async function loadNews() {
  const params = new URLSearchParams(state);
  const res = await fetch(`/api/news?${params.toString()}`);
  const { items, total, page, pageSize } = await res.json();

  const grid = document.getElementById('newsGrid');
  const pag = document.getElementById('pagination');
  grid.innerHTML = '';
  items.forEach(n => {
    grid.insertAdjacentHTML('beforeend', `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${n.imageUrl || 'https://picsum.photos/400/250'}" class="card-img-top" alt="${n.title}">
          <div class="card-body d-flex flex-column">
            <div class="mb-2 d-flex gap-2 flex-wrap">
              <span class="badge bg-success">${n.category}</span>
              <span class="badge badge-campus">${n.campus}</span>
            </div>
            <h5 class="card-title">${n.title}</h5>
            <p class="card-text">${n.summary}</p>
            <small class="text-muted mt-auto">${new Date(n.publishedAt).toLocaleString('pt-BR')}</small>
          </div>
        </div>
      </div>
    `);
  });

  // Paginação
  const pages = Math.ceil(total / pageSize);
  pag.innerHTML = '';
  const add = (p, label = p) => {
    pag.insertAdjacentHTML('beforeend', `<li class="page-item ${p===page?'active':''}"><a class="page-link" href="#" data-p="${p}">${label}</a></li>`);
  };
  add(Math.max(1, page-1), '«');
  for (let i = 1; i <= pages; i++) add(i);
  add(Math.min(pages, page+1), '»');

  pag.querySelectorAll('a').forEach(a => {
    a.onclick = (e) => {
      e.preventDefault();
      state.page = Number(a.dataset.p);
      loadNews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}

// ---------- Filtros ----------
document.getElementById('applyFilters')?.addEventListener('click', () => {
  state.campus = document.getElementById('campus').value;
  state.category = document.getElementById('category').value;
  state.page = 1;
  loadNews();
});

// ---------- Busca ----------
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  state.q = document.getElementById('q').value.trim();
  state.page = 1;
  loadNews();
});

// ---------- Login ----------
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    localStorage.setItem('token', data.token);
    alert('Login realizado com sucesso!');
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    modal.hide();
  } catch (err) { console.error(err); }
});

// ---------- Registro ----------
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    alert('Cadastro realizado com sucesso! Faça login.');
    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    modal.hide();
  } catch (err) { console.error(err); }
});

// ---------- Inicialização ----------
loadFeatured();
loadNews();
