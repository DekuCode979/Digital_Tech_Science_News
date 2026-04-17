// API Key de NewsAPI.org 
const API_KEY = process.env.NEWS_API_KEY;

const API_URL = `https://newsapi.org/v2/top-headlines?category=technology&language=es&pageSize=20&apiKey=${API_KEY}`;

async function fetchNews() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error en la respuesta de la API");
    const data = await res.json();
    const articles = data.articles || [];
    if (articles.length === 0) {
      document.getElementById("news-container").innerHTML = "<p class='text-light'>No se encontraron noticias.</p>";
      return;
    }
    renderNews(articles);
    window.topArticles = articles.slice(0, 10);
  } catch (err) {
    console.error("Error al cargar noticias:", err);
    document.getElementById("news-container").innerHTML = "<p class='text-danger'>Error al cargar noticias. Intenta más tarde.</p>";
  }
}

function renderNews(articles) {
  const container = document.getElementById("news-container");
  container.innerHTML = "";
  articles.forEach(article => {
    const imgSrc = article.urlToImage || "https://via.placeholder.com/400x200?text=Sin+Imagen";
    const card = `
      <div class="col-md-4">
        <div class="card h-100">
          <img src="${imgSrc}" class="card-img-top" alt="Imagen noticia">
          <div class="card-body">
            <h5 class="card-title">${article.title || "Sin título"}</h5>
            <p class="card-text">${article.description || "Sin descripción disponible."}</p>
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-info">Leer más</a>
          </div>
        </div>
      </div>`;
    container.innerHTML += card;
  });
}

function redactarProfesional(texto, titulo) {
  return `Título: ${titulo}\n\n` +
         `En el panorama actual, ${texto || "esta noticia destaca por su relevancia en el ámbito tecnológico y científico."} ` +
         `El artículo ofrece una visión clara de los avances recientes y su impacto en la sociedad moderna.\n\n` +
         `Además, se resalta cómo estos desarrollos pueden influir en el futuro cercano, abriendo nuevas oportunidades y planteando retos significativos. ` +
         `La información presentada resulta esencial para comprender la evolución de la innovación y la ciencia en nuestro tiempo.\n\n`;
}

function downloadTop10() {
  if (!window.topArticles || window.topArticles.length === 0) {
    alert("No hay noticias disponibles para descargar.");
    return;
  }
  let content = "";
  window.topArticles.forEach((a, i) => {
    content += `#${i+1}\n` + redactarProfesional(a.description, a.title);
  });
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Top10_Tecnologia_Ciencia.txt";
  link.click();
}

fetchNews();
