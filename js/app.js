const App = {
  STORAGE_KEY: 'ppw_service_orders',

  state: {
    projects: [],
    services: [],
    orders: [],
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
      form: document.getElementById('serviceForm'),
      serviceSelect: document.getElementById('kategoriLayanan'),
      orderBadge: document.getElementById('orderBadge'),
      orderHistory: document.getElementById('orderHistory'),
      toast: document.getElementById('appToast'),
      toastTitle: document.getElementById('appToastTitle'),
      toastMessage: document.getElementById('appToastMessage'),
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

    this.els.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    this.state.orders = this.loadOrders();
    this.renderOrders();

    this.loadProjects();
    this.loadServices();
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

  async loadServices() {
    try {
      this.state.services = await ApiService.getServices();
      this.state.services.forEach((s) => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.title} (Rp ${s.price.toLocaleString('id-ID')} ${s.unit})`;
        this.els.serviceSelect.appendChild(option);
      });
      this.renderOrders();
    } catch (err) {
      this.els.serviceSelect.options[0].textContent = 'Daftar layanan gagal dimuat';
    }
  },

  serviceTitle(serviceId) {
    const found = this.state.services.find((s) => s.id === serviceId);
    return found ? found.title : serviceId;
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    const form = this.els.form;
    if (!form.checkValidity()) return;

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.dikirimPada = new Date().toISOString();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Mengirim...';

    try {
      const result = await ApiService.submitServiceOrder(payload);
      this.saveOrder({ ...payload, orderId: result.id });
      this.showToast('Sukses!', 'Permintaan layanan berhasil diproses oleh API.', 'success');
      form.reset();
      form.classList.remove('was-validated');
    } catch (err) {
      this.showToast('Gagal!', 'Permintaan tidak dapat dikirim. Coba lagi beberapa saat.', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  },

  loadOrders() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('[Storage Error]:', err);
      return [];
    }
  },

  saveOrder(order) {
    this.state.orders.unshift(order);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state.orders));
    } catch (err) {
      console.error('[Storage Error]:', err);
    }
    this.renderOrders();
  },

  renderOrders() {
    const { orders } = this.state;
    this.els.orderBadge.textContent = orders.length;

    if (orders.length === 0) {
      this.els.orderHistory.innerHTML = '<li>Belum ada pemesanan.</li>';
      return;
    }

    const e = (v) => this.escapeHTML(v);
    this.els.orderHistory.innerHTML = orders
      .slice(0, 5)
      .map((o) => {
        const waktu = new Date(o.dikirimPada).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        return `
          <li class="border-bottom pb-2 mb-2">
            <span class="d-block fw-semibold text-dark">${e(this.serviceTitle(o.kategori))}</span>
            <span class="d-block">${e(o.nama)} &bull; ${e(o.estimasi)} pekan</span>
            <span class="d-block text-muted">${e(waktu)}</span>
          </li>`;
      })
      .join('');
  },

  showToast(title, message, type = 'success') {
    const { toast, toastTitle, toastMessage } = this.els;
    toast.classList.remove('text-bg-success', 'text-bg-danger');
    toast.classList.add(`text-bg-${type}`);
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 4000 }).show();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());