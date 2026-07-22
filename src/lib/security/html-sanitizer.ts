/**
 * Lightweight HTML sanitizer — no external dependencies.
 * Strips dangerous tags (script, iframe, object, embed, form, etc.),
 * removes on* event handlers, and blocks javascript: URLs.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code", "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption", "hr", "div", "span",
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  "*": new Set(["class", "id", "style"]),
  "a": new Set(["href", "target", "rel", "title"]),
  "img": new Set(["src", "alt", "width", "height", "loading"]),
}

const _DANGEROUS_ATTRS = /^on/i
const DANGEROUS_SCHEMES = /^(javascript|data|vbscript):/i

export function sanitizeHtml(html: string): string {
  if (!html) return ""

  // Remove script/style/iframe/object/embed/form tags and their contents
  let clean = html
    .replace(/<script\b[^<]*(?:<\/script>|\/?>)/gi, "")
    .replace(/<style\b[^<]*(?:<\/style>|\/?>)/gi, "")
    .replace(/<iframe\b[^<]*(?:<\/iframe>|\/?>)/gi, "")
    .replace(/<object\b[^<]*(?:<\/object>|\/?>)/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/<form\b[^<]*(?:<\/form>|\/?>)/gi, "")
    .replace(/<svg\b[^<]*(?:<\/svg>|\/?>)/gi, "")
    .replace(/<math\b[^<]*(?:<\/math>|\/?>)/gi, "")
    .replace(/<applet\b[^<]*(?:<\/applet>|\/?>)/gi, "")

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")

  // Block dangerous URL schemes in href/src attributes
  clean = clean.replace(
    /(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (match, attr, doubleQuoted, singleQuoted) => {
      const url = (doubleQuoted || singleQuoted || "").trim()
      if (DANGEROUS_SCHEMES.test(url)) {
        return `${attr}=""`
      }
      return match
    }
  )

  return clean
}

export { ALLOWED_TAGS, ALLOWED_ATTRS }
