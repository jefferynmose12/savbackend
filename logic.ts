export function evaluateLead(answers: string[]): string {
  const text = answers.join(" ").toLowerCase();

  if (text.includes("student") || text.includes("no budget")) {
    return "Not relevant";
  }
  if (text.includes("side project") || text.includes("unsure")) {
    return "Weak lead";
  }
  if (text.includes("scaling") || text.includes("hiring")) {
    return "Hot lead";
  }
  if (
    text.includes("1000") ||
    text.includes("large company") ||
    text.includes("enterprise") ||
    text.includes("large")
  ) {
    return "Very big potential customer";
  }

  return "Weak lead";
}
