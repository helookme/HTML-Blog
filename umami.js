(function () {
  var SHARE_ID = '5ESTs8jIv3PziJdE';
  var BASE = 'https://umami.578113.xyz/api';
  var cfg = null;
  var pending = [];

  // 从分享链接自动获取 websiteId + token（token 过期也不用改代码）
  function loadConfig(cb) {
    if (cfg) { cb(cfg); return; }
    pending.push(cb);
    if (pending.length > 1) return;
    fetch(BASE + '/share/' + SHARE_ID)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.token && d.websiteId) cfg = { websiteId: d.websiteId, token: d.token };
        pending.splice(0).forEach(function (fn) { fn(cfg); });
      })
      .catch(function () { pending.splice(0).forEach(function (fn) { fn(null); }); });
  }

  // 通用统计请求：umamiFetch('/websites/{id}/stats', '?startAt=...') -> Promise<json|null>
  // 结果缓存到 localStorage（10 分钟内不重复请求，key 已去掉变化的 endAt）
  var CACHE_TTL = 10 * 60 * 1000;
  window.umamiFetch = function (path, query) {
    return new Promise(function (resolve) {
      var normQuery = (query || '').replace(/endAt=\d+/g, '');
      var cacheKey = 'umami:' + path + ':' + normQuery;
      try {
        var hit = localStorage.getItem(cacheKey);
        if (hit) {
          var parsed = JSON.parse(hit);
          if (parsed && Date.now() - parsed.ts < CACHE_TTL) {
            resolve(parsed.data);
            return;
          }
        }
      } catch (e) { /* 忽略缓存错误 */ }
      loadConfig(function (c) {
        if (!c) { resolve(null); return; }
        var url = BASE + path.replace('{id}', c.websiteId) + (query || '');
        fetch(url, { headers: { 'accept': 'application/json', 'x-umami-share-token': c.token } })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) { /* 存储失败不阻塞 */ }
            resolve(data);
          })
          .catch(function () { resolve(null); });
      });
    });
  };

  // 统计卡片自动填充（全站共用）
  function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('total-pageviews')) return;
    var endAt = Date.now();
    window.umamiFetch('/websites/{id}/stats', '?startAt=0&endAt=' + endAt + '&unit=hour&timezone=Asia%2FShanghai')
      .then(function (data) {
        if (!data) {
          ['total-pageviews', 'total-visits', 'total-visitors'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = '获取失败';
          });
          return;
        }
        var pv = document.getElementById('total-pageviews');
        var v = document.getElementById('total-visits');
        var vs = document.getElementById('total-visitors');
        if (pv) pv.textContent = fmt(data.pageviews || 0);
        if (v) v.textContent = fmt(data.visits || 0);
        if (vs) vs.textContent = fmt(data.visitors || 0);
      });
  });
})();
