export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const API_KEY = process.env.NEWS_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key no configurada" });
  }

  const url = `https://newsapi.org/v2/top-headlines?category=technology&language=es&pageSize=20&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Error al obtener noticias"
      });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      error: "Error al conectar con el servidor de noticias"
    });
  }
}
