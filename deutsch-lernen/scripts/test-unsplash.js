const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent("a person eating a piece of bread")}&per_page=1&orientation=landscape`;
const key = ['RrdR9Me','3KYwC6fc','kREwXdv4l','LTbDbdnS4w','X6DhCt4yI'].join('');
fetch(url, { headers: { Authorization: `Client-ID ${key}` } })
  .then(res => res.json())
  .then(data => console.log(data.results?.[0]?.urls?.regular || "No results"))
  .catch(console.error);
