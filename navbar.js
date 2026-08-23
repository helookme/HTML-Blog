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

    // ===== 复制链接 =====
    function fallbackCopy(text, done) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } catch (e) {
        alert('复制失败，请手动复制：' + text);
      }
      document.body.removeChild(ta);
    }
    function copyLink(btn) {
      var url = window.location.href;
      var done = function () {
        var old = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> 已复制';
        setTimeout(function () { btn.innerHTML = old; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url, done); });
      } else {
        fallbackCopy(url, done);
      }
    }

    // ===== 侧拉栏（返回顶部 / 复制链接） =====
    var fab = document.getElementById('side-fab');
    var panel = document.getElementById('side-panel');
    function setPanelIcon(open) {
      if (!fab) return;
      var svg = fab.querySelector('svg');
      if (!svg) return;
      svg.innerHTML = open
        ? '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'
        : '<circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>';
      svg.classList.remove('fab-icon-spin');
      void svg.offsetWidth;
      svg.classList.add('fab-icon-spin');
    }
    function setPanel(open) {
      if (!panel) return;
      panel.classList.toggle('open', open);
      setPanelIcon(open);
    }
    if (fab && panel) {
      fab.addEventListener('click', function (e) {
        e.stopPropagation();
        setPanel(!panel.classList.contains('open'));
        // 点击涟漪
        var rect = fab.getBoundingClientRect();
        var rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.left = (e.clientX - rect.left - 22) + 'px';
        rip.style.top = (e.clientY - rect.top - 22) + 'px';
        fab.appendChild(rip);
        setTimeout(function () { rip.remove(); }, 650);
      });
      var toTop = document.getElementById('side-to-top');
      if (toTop) {
        toTop.addEventListener('click', function () {
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (e) {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
          }
          panel.classList.remove('open');
        });
      }
      var shareBtn = document.getElementById('side-share');
      if (shareBtn) {
        shareBtn.addEventListener('click', function () {
          panel.classList.remove('open');
          copyLink(shareBtn);
        });
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
      if (!e.target.closest('.side-widget')) setPanel(false);
    });
    // Esc 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); closeSuggest(); setPanel(false); }
    });

    // ===== 下滑隐藏 / 上滑显示 =====
    var lastScrollY = window.pageYOffset || 0;
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || 0;
      if (y > 120 && y > lastScrollY) {
        if (navbar) navbar.classList.add('navbar-hidden');
        closeMenu();
        closeSuggest();
      } else if (y < lastScrollY) {
        if (navbar) navbar.classList.remove('navbar-hidden');
      }
      if (fab) {
        if (y > 120) fab.classList.add('show');
        else { fab.classList.remove('show'); setPanel(false); }
      }
      lastScrollY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScroll);
    });
    onScroll(); // 页面加载时也检查一次

    // ===== 搜索联想下拉 =====
    if (!navbarSearch) return;
    var postsCache = null;
    var suggestTimer = null;

    function loadPosts(cb) {
      if (postsCache) { cb(postsCache); return; }
      fetch('/blog.json')
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
          return '<a class="navbar-suggest-item" href="/posts/' + encodeURIComponent(p.slug) + '/">' +
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
          location.href = 'blog?q=' + encodeURIComponent(navbarSearch.value.trim());
        }
      });
    }

    // ===== 点击同页链接不重复加载 =====
    function samePageClick(e) {
      var href = (e.currentTarget.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!href || href.indexOf('http') === 0) return;
      var norm = function (p) {
        if (p === '/' || p === '') return '/';
        return p;
      };
      if (norm(href) === norm(window.location.pathname)) {
        e.preventDefault();
        if ((window.pageYOffset || 0) > 0) {
          try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
          catch (err) { window.scrollTo(0, 0); }
        }
      }
    }
    document.querySelectorAll('.navbar a').forEach(function (a) {
      a.addEventListener('click', samePageClick);
    });

    // ===== 显示部署 commit 哈希 =====
    var commitEl = document.getElementById('commit-hash');
    if (commitEl) {
      fetch('/commit.json')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.sha) {
            commitEl.textContent = 'Commit ' + d.sha.slice(0, 7);
            commitEl.title = d.sha;
          }
        })
        .catch(function () {});
    }
  });
})();