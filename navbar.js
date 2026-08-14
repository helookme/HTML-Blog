(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navbar-menu');
    var navbar = document.querySelector('.navbar');
    var navbarSearch = document.getElementById('navbar-search');
    var suggestEl = document.getElementById('navbar-suggest');

    function closeMenu() {
      if (navMenu) navMenu.classList.remove('open');
      if (hamburger) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
    function closeSuggest() {
      if (suggestEl) {
        suggestEl.classList.remove('show');
        suggestEl.innerHTML = '';
      }
    }

    // ===== 汉堡菜单开合 =====
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // 点击外部关闭
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.navbar')) closeMenu();
      if (!e.target.closest('.navbar-search')) closeSuggest();
    });
    // Esc 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); closeSuggest(); }
    });

    // ===== 下滑隐藏 / 上滑显示 =====
    if (navbar) {
      var lastScrollY = window.pageYOffset || 0;
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          var y = window.pageYOffset || 0;
          if (y > 120 && y > lastScrollY) {
            navbar.classList.add('navbar-hidden');
            closeMenu();
            closeSuggest();
          } else if (y < lastScrollY) {
            navbar.classList.remove('navbar-hidden');
          }
          lastScrollY = y;
          ticking = false;
        });
      });
    }

    // ===== 搜索联想下拉 =====
    if (!navbarSearch) return;
    var postsCache = null;
    var suggestTimer = null;

    function loadPosts(cb) {
      if (postsCache) { cb(postsCache); return; }
      fetch('blog.json')
        .then(function (r) { return r.json(); })
        .then(function (p) { postsCache = p; cb(p); })
        .catch(function () { cb([]); });
    }

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function highlight(text, term) {
      var et = esc(text);
      var t = (term || '').trim().toLowerCase();
      if (!t) return et;
      var idx = et.toLowerCase().indexOf(t);
      if (idx === -1) return et;
      var len = term.trim().length;
      return et.slice(0, idx) + '<mark>' + et.slice(idx, idx + len) + '</mark>' + et.slice(idx + len);
    }

    function makeExcerpt(post) {
      var raw = post.description || post.content || '';
      raw = raw.replace(/[*#>`~]/g, '').replace(/\[|\]/g, '').replace(/\s+/g, ' ').trim();
      if (raw.length > 90) raw = raw.slice(0, 90) + '…';
      return raw;
    }

    function renderSuggestions(term) {
      var t = (term || '').trim().toLowerCase();
      if (!t || !suggestEl) { closeSuggest(); return; }
      loadPosts(function (posts) {
        if (!suggestEl) return;
        var matched = posts.filter(function (p) {
          return (p.title && p.title.toLowerCase().indexOf(t) !== -1) ||
                 (p.description && p.description.toLowerCase().indexOf(t) !== -1) ||
                 (p.tags && p.tags.some(function (tag) { return tag.toLowerCase().indexOf(t) !== -1; })) ||
                 (p.content && p.content.toLowerCase().indexOf(t) !== -1);
        }).slice(0, 8);
        if (!matched.length) {
          suggestEl.innerHTML = '<div class="navbar-suggest-empty">没有找到相关文章</div>';
          suggestEl.classList.add('show');
          return;
        }
        suggestEl.innerHTML = matched.map(function (p) {
          return '<a class="navbar-suggest-item" href="reader.html?slug=' + encodeURIComponent(p.slug) + '">' +
            '<div class="navbar-suggest-title">' + highlight(p.title, term) + '</div>' +
            '<div class="navbar-suggest-excerpt">' + highlight(makeExcerpt(p), term) + '</div>' +
            '</a>';
        }).join('');
        suggestEl.classList.add('show');
      });
    }

    function onSearchInput(v) {
      clearTimeout(suggestTimer);
      suggestTimer = setTimeout(function () { renderSuggestions(v); }, 120);
    }

    var listSearch = document.getElementById('search');
    if (listSearch) {
      // 文章列表页：双向同步 + 联想
      navbarSearch.addEventListener('input', function () {
        listSearch.value = navbarSearch.value;
        listSearch.dispatchEvent(new Event('input', { bubbles: true }));
        onSearchInput(navbarSearch.value);
      });
      listSearch.addEventListener('input', function () {
        navbarSearch.value = listSearch.value;
        onSearchInput(listSearch.value);
      });
    } else {
      // 其他页面：输入联想 + 回车跳转到文章列表搜索
      navbarSearch.addEventListener('input', function () { onSearchInput(navbarSearch.value); });
      navbarSearch.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && navbarSearch.value.trim()) {
          location.href = 'blog.html?q=' + encodeURIComponent(navbarSearch.value.trim());
        }
      });
    }
  });
})();