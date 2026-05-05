exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { model, prompt, size, logoB64, logoMime } = JSON.parse(event.body);

    let response;

    if (logoB64) {
      const formData = new FormData();
      formData.append("model", model);
      formData.append("prompt", prompt);
      formData.append("size", size);
      formData.append("n", "1");

      const buffer = Buffer.from(logoB64, "base64");
      const mime = logoMime || "image/png";
      const ext = mime.split("/")[1] || "png";
      const blob = new Blob([buffer], { type: mime });
      formData.append("image", blob, `logo.${ext}`);

      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: formData,
      });
    } else {
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model, prompt, n: 1, size }),
      });
    }

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
