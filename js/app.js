const App = {
  state: {
    projects: [],
    activeCategory: 'Semua',
  },

  els: {},

  init() {
    this.els = {
      grid: document.getElementById('projectGrid'),
      filters: document.getElementById('projectFilters'),
      loading: document.getElementById('projectLoading'),
      error: document.getElementById('projectError'),
      empty: document.getElementById('projectEmpty'),
      modal: document.getElementById('universalProjectModal'),
      modalTitle: document.getElementById('projectModalTitle'),
      modalBody: document.getElementById('projectModalBody'),
      modalLink: document.getElementById('projectModalLink'),
    };

    this.els.filters.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (!btn) return;
      this.state.activeCategory = btn.dataset.category;
      this.renderFilters();
      this.renderProjects();
    });

    this.els.grid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-project-id]');
      if (!btn) return;
      this.openProjectModal(btn.dataset.projectId);
    });

    this.loadProjects();
  },

  escapeHTML(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value).replace(/[&<>"']/g, (c) => map[c]);
  },

  setUIState(state, message = '') {
    const { loading, error, empty, grid } = this.els;
    loading.classList.toggle('d-none', state !== 'loading');
    error.classList.toggle('d-none', state !== 'error');
    empty.classList.toggle('d-none', state !== 'empty');
    grid.classList.toggle('d-none', state !== 'success');
    if (state === 'error') error.textContent = message;
  },

  async loadProjects() {
    this.setUIState('loading');
    try {
      this.state.projects = await ApiService.getProjects();
      this.renderFilters();
      this.renderProjects();
    } catch (err) {
      this.setUIState('error', `Gagal memuat data proyek. Silakan muat ulang halaman. (${err.message})`);
    }
  },

  renderFilters() {
    const categories = ['Semua', ...new Set(this.state.projects.map((p) => p.category))];
    this.els.filters.innerHTML = categories
      .map((cat) => {
        const style = cat === this.state.activeCategory ? 'btn-primary-pill' : 'btn-outline-pink';
        return `<button type="button" class="btn btn-sm ${style} rounded-pill px-3 py-1" data-category="${this.escapeHTML(cat)}">${this.escapeHTML(cat)}</button>`;
      })
      .join('');
  },

  renderProjects() {
    const { projects, activeCategory } = this.state;
    const list = activeCategory === 'Semua'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

    if (list.length === 0) {
      this.els.grid.innerHTML = '';
      this.setUIState('empty');
      return;
    }

    this.els.grid.innerHTML = list.map((p) => this.projectCardTemplate(p)).join('');
    this.setUIState('success');
  },

  projectCardTemplate(p) {
    const e = (v) => this.escapeHTML(v);
    const tags = p.tags.map((t) => `<span class="tech-pill">${e(t)}</span>`).join('');
    return `
      <div class="col">
        <div class="card h-100 project-card border-0 shadow-sm p-4 rounded-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="badge bg-pink-soft text-pink px-3 py-2 rounded-pill fw-semibold">${e(p.category)} &bull; ${e(p.year)}</span>
            <span class="badge bg-light text-muted border px-2 py-1"><i class="bi bi-check-circle-fill text-success me-1"></i>${e(p.status)}</span>
          </div>
          <h3 class="card-title fw-bold mb-2">${e(p.title)}</h3>
          <p class="text-muted flex-grow-1 small">${e(p.summary)}</p>
          <div class="mb-3">${tags}</div>
          <button class="btn btn-outline-pink w-100 rounded-pill" data-project-id="${e(p.id)}" aria-haspopup="dialog">
            <i class="bi bi-info-circle me-1"></i> Lihat Rincian Proyek
          </button>
        </div>
      </div>`;
  },

  openProjectModal(projectId) {
    const p = this.state.projects.find((item) => String(item.id) === String(projectId));
    if (!p) return;

    const e = (v) => this.escapeHTML(v);
    const metrics = p.metrics
      .map((m) => `<li><i class="bi bi-check2-circle text-pink me-2"></i><strong>${e(m.label)}:</strong> ${e(m.value)}</li>`)
      .join('');
    const tags = p.tags.map((t) => `<span class="tech-pill">${e(t)}</span>`).join('');

    this.els.modalTitle.textContent = p.title;
    this.els.modalBody.innerHTML = `
      <img src="${e(p.thumbnail)}" class="img-fluid rounded-3 mb-3 w-100" alt="Tampilan proyek ${e(p.title)}">
      <p class="text-muted small mb-3">${e(p.description)}</p>
      <p class="small mb-2"><strong>Peran:</strong> <span class="text-muted">${e(p.role)}</span></p>
      <ul class="list-unstyled small text-muted mb-3">${metrics}</ul>
      <div>${tags}</div>`;

    const isRealLink = /^https?:\/\//i.test(p.link);
    this.els.modalLink.classList.toggle('d-none', !isRealLink);
    if (isRealLink) this.els.modalLink.setAttribute('href', p.link);

    bootstrap.Modal.getOrCreateInstance(this.els.modal).show();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());