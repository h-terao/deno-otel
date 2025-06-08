let resp: Response;

resp = await fetch(
  "http://localhost:8000/dice?rolls=6&sides=6",
  { method: "GET" },
);
console.log("6d3:", await resp.json());

resp = await fetch(
  "http://localhost:8000/dice?rolls=10&sides=100",
  { method: "GET" },
);
console.log("100d10:", await resp.json());
