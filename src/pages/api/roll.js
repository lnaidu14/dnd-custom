export default function handler(req, res) {
  const { dice } = req.query; // expects something like "1d20" or "2d6"
  
  if (!dice) return res.status(400).json({ error: "No dice specified" });

  const match = dice.match(/(\d+)d(\d+)/);
  if (!match) return res.status(400).json({ error: "Invalid dice format" });

  const [_, countStr, sidesStr] = match;
  const count = parseInt(countStr);
  const sides = parseInt(sidesStr);

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((a, b) => a + b, 0);

  res.status(200).json({ rolls, total });
}
