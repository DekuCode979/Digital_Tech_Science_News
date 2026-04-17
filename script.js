// Para desarrollo local, pega aquí tu llave entre comillas:
const API_KEY = "TU_API_KEY_AQUI"; 

const API_URL = `https://newsapi.org/v2/top-headlines?category=technology&language=es&pageSize=20&apiKey=${API_KEY}`;

async function fetchNews() {
  const container = document.getElementById("news-container");
  try {
    const res = await fetch(API_URL);
    
    // NewsAPI a veces devuelve error 426 en local por restricciones de CORS
    if (res.status === 426) {
        throw new Error("NewsAPI no permite peticiones desde el navegador en el plan gratuito (CORS).");
    }

    if (!res.ok) throw new Error("Error en la respuesta de la API");
    
    const data = await res.json();
    const articles = data.articles || [];

    if (articles.length === 0) {
      container.innerHTML = "<p class='text-center'>No se encontraron noticias en este momento.</p>";
      return;
    }

    renderNews(articles);
    // Guardamos los 10 primeros para la descarga
    window.topArticles = articles.slice(0, 10);

  } catch (err) {
    console.error("Error al cargar noticias:", err);
    container.innerHTML = `<div class='alert alert-danger'>${err.message}</div>`;
  }
}

function renderNews(articles) {
  const container = document.getElementById("news-container");
  container.innerHTML = ""; // Limpiar antes de renderizar
  
  // Usamos un fragmento para mejorar el rendimiento del DOM
  const fragment = document.createDocumentFragment();

  articles.forEach(article => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4"; // Ajustado para mejor responsividad
    
    const imgSrc = article.urlToImage || "https://via.placeholder.com/400x200?text=Tecnología";
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <img src="${imgSrc}" class="card-img-top" alt="${article.title}" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title h6 fw-bold">${article.title || "Sin título"}</h5>
            <p class="card-text small text-muted">${article.description || "Sin descripción disponible."}</p>
            <div class="mt-auto">
                <a href="${article.url}" target="_blank" class="btn btn-sm btn-info text-white w-100">Leer noticia completa</a>
            </div>
          </div>
        </div>`;
    fragment.appendChild(col);
  });
  
  container.appendChild(fragment);
}

// Lógica de redacción y descarga (Se mantiene igual, funciona bien)
function redactarProfesional(texto, titulo) {
  return `TÍTULO: ${titulo}\n` +
         `RESUMEN PROFESIONAL:\n` +
         `En el panorama actual, ${texto || "esta noticia destaca por su relevancia en el ámbito tecnológico."} ` +
         `Representa un hito en la innovación contemporánea.\n\n` +
         `--------------------------------------------------\n\n`;
}

window.downloadTop10 = function() {
  if (!window.topArticles || window.topArticles.length === 0) {
    alert("⚠️ Primero debes cargar las noticias.");
    return;
  }
  
  let content = "--- REPORTE TOP 10 TECNOLOGÍA Y CIENCIA ---\n\n";
  window.topArticles.forEach((a, i) => {
    content += `NOTICIA #${i+1}\n` + redactarProfesional(a.description, a.title);
  });
  
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Reporte_Tech_${new Date().toLocaleDateString()}.txt`;
  link.click();
  URL.revokeObjectURL(link.href); // Limpieza de memoria
};

// Iniciar app
fetchNews();
