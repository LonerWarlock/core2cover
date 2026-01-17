import axios from "axios";

export async function POST(request) {
  try {
    const { q } = await request.json();

    if (!q || q.length < 3) {
      return Response.json({ error: "Min 3 characters required" }, { status: 400 });
    }

    const response = await axios.get("https://us1.locationiq.com/v1/autocomplete.php", {
      params: {
        key: process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY, //
        q: q,
        limit: 5,
        countrycodes: "in", // Restricts search results to India
      }
    });

    return Response.json(response.data);
  } catch (error) {
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}