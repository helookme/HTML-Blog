(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    // ===== 汉堡菜单开合 =====
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navbar-menu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // 点击菜单外部关闭
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.navbar')) {
          navMenu.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
      // Esc 关闭
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          navMenu.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // ===== 导航栏搜索 =====
    var navbarSearch = document.getElementById('navbar-search');
    if (!navbarSearch) return;
    var listSearch = document.getElementById('search');
    if (listSearch) {
      // 文章列表页：双向同步
      navbarSearch.addEventListener('input', function () {
        listSearch.value = navbarSearch.value;
        listSearch.dispatchEvent(new Event('input', { bubbles: true }));
      });
      listSearch.addEventListener('input', function () {
        navbarSearch.value = listSearch.value;
      });
    } else {
      // 其他页面：回车跳转到文章列表搜索
      navbarSearch.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && navbarSearch.value.trim()) {
          location.href = 'blog.html?q=' + encodeURIComponent(navbarSearch.value.trim());
        }
      });
    }
  });
})();
