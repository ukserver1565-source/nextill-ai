import type { ParsedArticle } from "./parser"

export function formatArticleHTML(article: ParsedArticle): string {
  let html = `<!DOCTYPE html><html><head><title>${article.metaTitle}</title>`
  html += `<meta name="description" content="${article.metaDescription}">`
  html += `<link rel="canonical" href="/${article.slug}"></head><body>`
  html += `<article><h1>${article.title}</h1>`
  for (const section of article.outline) {
    html += `<h2>${section}</h2><p>${section}</p>`
  }
  html += `<div>${article.content.replace(/\n/g, "<br>")}</div>`
  if (article.faqs.length) {
    html += `<section class="faqs">${article.faqs.map(f => `<div><h3>${f.question}</h3><p>${f.answer}</p></div>`).join("")}</section>`
  }
  if (article.conclusion) html += `<section class="conclusion"><h2>Conclusion</h2><p>${article.conclusion}</p></section>`
  html += `<footer><p>${article.cta}</p></footer></article></body></html>`
  return html
}

export function formatArticleMarkdown(article: ParsedArticle): string {
  let md = `# ${article.title}\n\n`
  md += `> ${article.excerpt}\n\n`
  for (const section of article.outline) {
    md += `## ${section}\n\n`
  }
  md += `${article.content}\n\n`
  if (article.faqs.length) {
    md += `## FAQs\n\n${article.faqs.map(f => `**Q:** ${f.question}\n\n**A:** ${f.answer}\n\n`).join("---\n\n")}`
  }
  if (article.conclusion) md += `## Conclusion\n\n${article.conclusion}\n\n`
  if (article.cta) md += `${article.cta}\n`
  md += `\n---\n*Word Count: ${article.wordCount} | Reading Time: ${article.readingTime} min*`
  return md
}

export function formatArticleTXT(article: ParsedArticle): string {
  let txt = `${article.title}\n${"=".repeat(article.title.length)}\n\n`
  txt += `${article.excerpt}\n\n`
  for (const section of article.outline) {
    txt += `${section}\n${"-".repeat(section.length)}\n\n`
  }
  txt += `${article.content.replace(/<[^>]+>/g, "")}\n\n`
  if (article.faqs.length) {
    txt += "FAQs:\n"
    for (const f of article.faqs) txt += `Q: ${f.question}\nA: ${f.answer}\n\n`
  }
  if (article.conclusion) txt += `Conclusion:\n${article.conclusion}\n\n`
  if (article.cta) txt += `${article.cta}\n`
  txt += `\nWord Count: ${article.wordCount} | Reading Time: ${article.readingTime} min\n`
  return txt
}
