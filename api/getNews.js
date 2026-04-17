export default async function handler(req, res) {
  
  const API_KEY = process.env.NEWS_API_KEY; 
  const url = `https://newsapi.org/v2/top-headlines?category=technology&language=es&pageSize=20&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Si la API de noticias da error
    if (!response.ok) {
        return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al conectar con el servidor de noticias" });
  }
}