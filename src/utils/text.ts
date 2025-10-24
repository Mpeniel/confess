export const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

export const toWords = (s: string) => (normalize(s) ? normalize(s).split(" ") : []);

// Levenshtein simple (suffisant ici)
export function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/* ----------------- Matching strategies ----------------- */
/** 1) Fuzzy fenêtre glissante : on balaie une fenêtre ~ taille cible (+/- slack) et on prend la meilleure distance */
export function fuzzyWindowMatch(buffer: string, target: string, slackWords = 2, maxRatio = 0.22) {
  const bufWords = toWords(buffer);
  const tgtWords = toWords(target);
  if (bufWords.length < 2 || tgtWords.length === 0) return null;

  const winMin = Math.max(1, tgtWords.length - slackWords);
  const winMax = tgtWords.length + slackWords;

  let best = { dist: Infinity, start: 0, end: 0 };
  for (let w = winMin; w <= winMax; w++) {
    if (w > bufWords.length) break;
    for (let i = 0; i + w <= bufWords.length; i++) {
      const segment = bufWords.slice(i, i + w).join(" ");
      const d = levenshtein(segment, tgtWords.join(" "));
      if (d < best.dist) best = { dist: d, start: i, end: i + w };
    }
  }
  const tgtLen = tgtWords.join(" ").length || 1;
  const ratio = best.dist / tgtLen;
  if (ratio <= maxRatio) {
    // retourne indices de mots et indices de caractères correspondants dans buffer normalisé
    const pre = bufWords.slice(0, best.end).join(" ");
    return {
      ok: true,
      consumeChars: pre.length, // on consomme jusqu'à la fin de la fenêtre
    };
  }
  return null;
}

/** 2) Ancres en ordre : exiger les stems en séquence (tolérance via startsWith) */
export function anchorOrderMatch(buffer: string, anchors: string[]) {
  const words = toWords(buffer);
  let idx = 0;
  for (const anchor of anchors) {
    let found = false;
    while (idx < words.length) {
      const w = words[idx++];
      // tolère les déformations : "christ" ~ "chris", "ressuscite"/"ressusciter" ~ "ressuscit"
      if (w.startsWith(anchor)) { found = true; break; }
    }
    if (!found) return null;
  }
  // si toutes les ancres sont vues dans l'ordre, on consomme jusqu'à la dernière
  return { ok: true, consumeChars: words.join(" ").length };
}