export default async function handler(req, res) {
  const API_KEY = process.env.NEWS_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key no configurada" });
  }

  const url = `https://gnews.io/api/v4/top-headlines?topic=technology&lang=es&max=10&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Error al obtener noticias"
      });
    }

    // Adaptamos formato
    const adapted = {
      articles: data.articles.map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.image
      }))
    };

    res.status(200).json(adapted);

  } catch (error) {
    res.status(500).json({
      error: "Error al conectar con GNews"
    });
  }
}
