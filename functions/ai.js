// Cloudflare Pages Function - POST /ai
export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  let body = {};
  try {
    body = await request.json();
  } catch (e) {}

  const prompt = body.prompt || "";

  // If no API key set yet, return test output
  if (!env.GROQ_API_KEY) {
    return new Response(JSON.stringify({
      success: true,
      note: "Function active but GROQ_API_KEY not set",
      promptReceived: prompt
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // Actual Groq request
  try {
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a YouTube script generator." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1500
        })
      }
    );

    const data = await groqRes.json();

    return new Response(JSON.stringify({
      success: true,
      script: data?.choices?.[0]?.message?.content || ""
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
