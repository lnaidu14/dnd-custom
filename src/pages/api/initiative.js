export default function handler(req, res) {
  // Example: expects ?tokens=Player1,Player2,Monster1
  const { tokens } = req.query;
  if (!tokens) return res.status(400).json({ error: "No tokens provided" });

  const tokenList = tokens.split(",");

  // Roll d20 + initiative bonus (default 0 for simplicity)
  const initiativeOrder = tokenList.map((t) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = 0; // could extend to actual bonuses
    return { token: t, roll, total: roll + bonus };
  });

  // Sort descending by total
  initiativeOrder.sort((a, b) => b.total - a.total);

  res.status(200).json({ initiativeOrder });
}
