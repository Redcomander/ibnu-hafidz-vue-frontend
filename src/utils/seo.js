const DEFAULT_SEO = {
  title: 'Pondok Pesantren Tahfidz Ibnu Hafidz',
  description:
    "Pondok Pesantren Tahfidz Ibnu Hafidz membina generasi Qurani melalui tahfidz intensif, pendidikan formal, dan pembinaan karakter Islami.",
  image: '/welcome2.jpg',
  type: 'website',
  robots: 'index,follow',
  siteName: 'Ibnu Hafidz',
}

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://ibnuhafidz.ponpes.id/#organization',
  name: 'Pondok Pesantren Tahfidz Ibnu Hafidz',
  alternateName: 'Ibnu Hafidz',
  url: 'https://ibnuhafidz.ponpes.id/',
  logo: 'https://ibnuhafidz.ponpes.id/favicon.png',
  image: 'https://ibnuhafidz.ponpes.id/welcome2.jpg',
  email: 'info@ibnuhafidz.ponpes.id',
  telephone: '0812-0000-0000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kp. Cibuntu RT 01/RW 06',
    addressLocality: 'Cibitung',
    addressRegion: 'Jawa Barat',
    addressCountry: 'ID',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    telephone: '0812-0000-0000',
    email: 'info@ibnuhafidz.ponpes.id',
    availableLanguage: ['id', 'ar', 'en'],
    areaServed: 'ID',
  },
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://ibnuhafidz.ponpes.id/#website',
  url: 'https://ibnuhafidz.ponpes.id/',
  name: 'Ibnu Hafidz',
  description: DEFAULT_SEO.description,
  inLanguage: 'id-ID',
  publisher: {
    '@id': 'https://ibnuhafidz.ponpes.id/#organization',
  },
}

function ensureMetaTag(attribute, value) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }

  return element
}

function ensureLinkTag(rel) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  return element
}

function ensureStructuredDataScript(id) {
  let element = document.head.querySelector(`script[data-seo-structured-data="${id}"]`)

  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.setAttribute('data-seo-structured-data', id)
    document.head.appendChild(element)
  }

  return element
}

function applyStructuredData(structuredData = []) {
  const entries = [
    { id: 'organization', payload: ORGANIZATION_SCHEMA },
    { id: 'website', payload: WEBSITE_SCHEMA },
    ...structuredData,
  ]

  const activeIds = new Set(entries.map((entry) => entry.id))

  document.head
    .querySelectorAll('script[data-seo-structured-data]')
    .forEach((element) => {
      const id = element.getAttribute('data-seo-structured-data')

      if (!activeIds.has(id)) {
        element.remove()
      }
    })

  entries.forEach((entry) => {
    const element = ensureStructuredDataScript(entry.id)
    element.textContent = JSON.stringify(entry.payload)
  })
}

function toAbsoluteUrl(value) {
  if (!value) {
    return ''
  }

  return new URL(value, window.location.origin).toString()
}

export function applySeoMetadata(overrides = {}) {
  const seo = {
    ...DEFAULT_SEO,
    ...overrides,
  }

  const resolvedTitle = seo.title
    ? `${seo.title} — ${DEFAULT_SEO.siteName}`
    : `${DEFAULT_SEO.title} — ${DEFAULT_SEO.siteName}`
  const resolvedDescription = seo.description || DEFAULT_SEO.description
  const resolvedUrl = toAbsoluteUrl(seo.url || window.location.pathname)
  const resolvedImage = toAbsoluteUrl(seo.image || DEFAULT_SEO.image)
  const resolvedCanonical = toAbsoluteUrl(seo.canonical || seo.url || window.location.pathname)

  document.title = resolvedTitle

  ensureMetaTag('name', 'description').setAttribute('content', resolvedDescription)
  ensureMetaTag('name', 'robots').setAttribute('content', seo.robots || DEFAULT_SEO.robots)
  ensureMetaTag('property', 'og:site_name').setAttribute('content', seo.siteName || DEFAULT_SEO.siteName)
  ensureMetaTag('property', 'og:title').setAttribute('content', resolvedTitle)
  ensureMetaTag('property', 'og:description').setAttribute('content', resolvedDescription)
  ensureMetaTag('property', 'og:type').setAttribute('content', seo.type || DEFAULT_SEO.type)
  ensureMetaTag('property', 'og:url').setAttribute('content', resolvedUrl)
  ensureMetaTag('property', 'og:image').setAttribute('content', resolvedImage)
  ensureMetaTag('name', 'twitter:card').setAttribute('content', 'summary_large_image')
  ensureMetaTag('name', 'twitter:title').setAttribute('content', resolvedTitle)
  ensureMetaTag('name', 'twitter:description').setAttribute('content', resolvedDescription)
  ensureMetaTag('name', 'twitter:image').setAttribute('content', resolvedImage)
  ensureLinkTag('canonical').setAttribute('href', resolvedCanonical)
  applyStructuredData(seo.structuredData || [])
}

export const publicSeo = {
  home: {
    title: 'Pondok Pesantren Tahfidz Ibnu Hafidz',
    description:
      'Pondok Pesantren Tahfidz Ibnu Hafidz menghadirkan program tahfidz, pendidikan formal, pembinaan adab, dan lingkungan belajar Islami yang terarah.',
    url: '/',
    image: '/welcome2.jpg',
    type: 'website',
    robots: 'index,follow',
    structuredData: [
      {
        id: 'page',
        payload: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://ibnuhafidz.ponpes.id/#home',
          url: 'https://ibnuhafidz.ponpes.id/',
          name: 'Pondok Pesantren Tahfidz Ibnu Hafidz',
          description:
            'Pondok Pesantren Tahfidz Ibnu Hafidz menghadirkan program tahfidz, pendidikan formal, pembinaan adab, dan lingkungan belajar Islami yang terarah.',
          inLanguage: 'id-ID',
          isPartOf: {
            '@id': 'https://ibnuhafidz.ponpes.id/#website',
          },
          about: {
            '@id': 'https://ibnuhafidz.ponpes.id/#organization',
          },
          primaryImageOfPage: 'https://ibnuhafidz.ponpes.id/welcome2.jpg',
        },
      },
    ],
  },
  profile: {
    title: 'Profil Pondok Pesantren Tahfidz Ibnu Hafidz',
    description:
      'Pelajari sejarah, visi misi, program pendidikan, jadwal harian, dan tim pembina Pondok Pesantren Tahfidz Ibnu Hafidz.',
    url: '/profil',
    image: '/profil1.jpg',
    type: 'article',
    robots: 'index,follow',
    structuredData: [
      {
        id: 'page',
        payload: {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': 'https://ibnuhafidz.ponpes.id/#profile',
          url: 'https://ibnuhafidz.ponpes.id/profil',
          name: 'Profil Pondok Pesantren Tahfidz Ibnu Hafidz',
          description:
            'Pelajari sejarah, visi misi, program pendidikan, jadwal harian, dan tim pembina Pondok Pesantren Tahfidz Ibnu Hafidz.',
          inLanguage: 'id-ID',
          isPartOf: {
            '@id': 'https://ibnuhafidz.ponpes.id/#website',
          },
          about: {
            '@id': 'https://ibnuhafidz.ponpes.id/#organization',
          },
          primaryImageOfPage: 'https://ibnuhafidz.ponpes.id/profil1.jpg',
        },
      },
    ],
  },
}

export const nonPublicSeo = {
  title: 'Sistem Manajemen Pesantren',
  description:
    'Area internal untuk pengelolaan santri, guru, absensi, dan konten Pondok Pesantren Tahfidz Ibnu Hafidz.',
  image: '/favicon.png',
  type: 'website',
  robots: 'noindex,nofollow',
}