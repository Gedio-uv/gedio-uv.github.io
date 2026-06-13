const query = "a person eating a piece of bread, photorealistic, dynamic photography, natural light, cinematic, sharp focus, highly detailed, no text, no watermarks";
const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=500&nologo=true&model=flux-schnell&seed=12345`;
console.log(url);
