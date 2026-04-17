// =======================
// CONFIG
// =======================
const CACHE_KEY = "news_cache";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutos

const RSS_SOURCES = [
  "https://feeds.bbci.co.uk/mundo/tecnologia/rss.xml",
  "https://rss.cnn.com/rss/edition_technology.rss"
];

// =======================
// FALLBACK RSS (GitHub Pages)
// =======================
async function fetchFromRSS() {
  const results = [];

  for (const rss of RSS_SOURCES) {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const items = (data.items || []).map(a => ({
        title: a.title,
        description: a.description,
        url: a.link,
        urlToImage: a.thumbnail
      }));

      results.push(...items);

    } catch (e) {
      console.warn("Error RSS:", rss);
    }
  }

  return results.slice(0, 10);
}

// =======================
// RENDER NOTICIAS
// =======================
function renderNews(articles) {
  const container = document.getElementById("news-container");
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  articles.forEach(article => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const cleanDesc = (article.description || "").replace(/<[^>]+>/g, "");
    const imgSrc = article.urlToImage || "https://via.placeholder.com/400x200?text=Tech";

    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0">
        <img src="${imgSrc}" class="card-img-top" alt="${article.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title h6 fw-bold">${article.title}</h5>
          <p class="card-text small text-muted">${cleanDesc.substring(0, 120)}...</p>
          <div class="mt-auto">
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-info text-white w-100">
              Leer noticia
            </a>
          </div>
        </div>
      </div>
    `;

    fragment.appendChild(col);
  });

  container.appendChild(fragment);
}

// =======================
// FETCH PRINCIPAL (Vercel + fallback + cache)
// =======================
async function fetchNews() {
  const container = document.getElementById("news-container");

  try {
    const now = Date.now();

    // 🔥 CACHE
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);

      if (now - timestamp < CACHE_TIME) {
        console.log("⚡ Usando caché");
        renderNews(data);
        window.topArticles = data;
        return;
      }
    }

    let articles = [];

    // 🔵 Intentar Vercel API
    try {
      const res = await fetch("/api/getNews");

      if (res.ok) {
        const data = await res.json();
        articles = data.articles || [];
        console.log("✅ Usando API Vercel");
      } else {
        throw new Error("API falló");
      }

    } catch {
      console.log("⚠️ Usando RSS fallback");
      articles = await fetchFromRSS();
    }

    // Guardar en UI
    renderNews(articles);
    window.topArticles = articles.slice(0, 10);

    // 💾 Guardar cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: articles,
      timestamp: now
    }));

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class='alert alert-danger'>Error cargando noticias</div>`;
  }
}

// =======================
// DESCARGA TXT
// =======================
function redactarProfesional(texto, titulo) {
  return `TÍTULO: ${titulo}\nRESUMEN:\n${texto || "Sin descripción"}\n\n-------------------------\n\n`;
}

window.downloadTop10 = function () {
  if (!window.topArticles?.length) {
    alert("⚠️ Primero carga las noticias");
    return;
  }

  let content = "--- TOP 10 TECNOLOGÍA Y CIENCIA ---\n\n";

  window.topArticles.forEach((a, i) => {
    content += `#${i + 1}\n` + redactarProfesional(a.description, a.title);
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "noticias-tech.txt";
  link.click();

  URL.revokeObjectURL(link.href);
};

// =======================
// INICIO
// =======================
fetchNews();
