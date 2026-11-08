import DOMPurify from 'dompurify'

export function sanitizeArticleHtml(value) {
  return DOMPurify.sanitize(String(value || ''), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
    FORBID_ATTR: ['srcset'],
  })
}
