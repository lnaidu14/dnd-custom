export function rollDice(diceNotation) {
  // e.g., "2d6+3"
  const match = diceNotation.match(/(\d*)d(\d+)([+-]\d+)?/i);
  if (!match) throw new Error("Invalid dice notation");

  const numDice = parseInt(match[1]) || 1;
  const dieType = parseInt(match[2]);
  const modifier = parseInt(match[3]) || 0;

  const rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * dieType) + 1);
  }

  const total = rolls.reduce((a, b) => a + b, 0) + modifier;

  return { rolls, modifier, total, notation: diceNotation };
}

export function validateDiceNotation(notation) {
  return /^\d+d\d+$/.test(notation);
}
