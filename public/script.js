  // Store filter
  const pills = document.querySelectorAll('.store-pill');
  const cards = document.querySelectorAll('#grid .product-card');
  const featCards = document.querySelectorAll('.featured-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const store = pill.dataset.store;

      cards.forEach(c => {
        c.style.display = (store === 'all' || c.dataset.store === store) ? '' : 'none';
      });
      featCards.forEach(c => {
        c.style.display = (store === 'all' || c.dataset.store === store) ? '' : 'none';
      });

      // Hide featured section heading if no destaques visible
      const anyFeat = [...featCards].some(c => c.style.display !== 'none');
      document.querySelector('.featured-section').style.display = anyFeat ? '' : 'none';
    });
  });

  // Category tabs (visual)
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
