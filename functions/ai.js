export async function onRequest(context) {
  const { request, env } = context;

  // CORS FIX
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Read JSON input
  let body = {};
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers,
    });
  }

  const prompt = body.prompt || "";

  // Check secret
  if (!env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({
        success: true,
        note: "Function active but GROQ_API_KEY not set",
        promptReceived: prompt,
      }),
      { headers }
    );
  }

  // Call GROQ API
  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    })
  });

  const groqData = await groqResponse.json();

  return new Response(JSON.stringify(groqData), { headers });
}

