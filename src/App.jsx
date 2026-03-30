import { startTransition, useEffect, useState } from 'react'
import './App.css'

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'txt', label: 'Plain text' },
  { value: 'docx', label: 'DOCX' },
  { value: 'pdf', label: 'PDF' },
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'mp4', label: 'MP4' },
  { value: 'mp3', label: 'MP3' },
]

const BINARY_SOURCE_FORMATS = new Set(['docx', 'pdf', 'jpg', 'png', 'webp', 'mp4', 'mp3'])
const DOCUMENT_TARGET_FORMATS = new Set(['docx', 'pdf'])
const IMAGE_FORMATS = new Set(['jpg', 'png', 'webp'])
const AUDIO_VIDEO_FORMATS = new Set(['mp4', 'mp3'])

const FORMAT_EXTENSIONS = {
  csv: 'csv',
  json: 'json',
  markdown: 'md',
  html: 'html',
  txt: 'txt',
  docx: 'docx',
  pdf: 'pdf',
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
  mp4: 'mp4',
  mp3: 'mp3',
}

const MIME_TYPES = {
  csv: 'text/csv;charset=utf-8',
  json: 'application/json;charset=utf-8',
  markdown: 'text/markdown;charset=utf-8',
  html: 'text/html;charset=utf-8',
  txt: 'text/plain;charset=utf-8',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
}

const SUPPORTED_CONVERSIONS = [
  { from: 'csv', to: 'json' },
  { from: 'csv', to: 'pdf' },
  { from: 'csv', to: 'docx' },
  { from: 'json', to: 'csv' },
  { from: 'json', to: 'pdf' },
  { from: 'json', to: 'docx' },
  { from: 'markdown', to: 'html' },
  { from: 'markdown', to: 'txt' },
  { from: 'markdown', to: 'pdf' },
  { from: 'markdown', to: 'docx' },
  { from: 'html', to: 'markdown' },
  { from: 'html', to: 'txt' },
  { from: 'html', to: 'pdf' },
  { from: 'html', to: 'docx' },
  { from: 'txt', to: 'html' },
  { from: 'txt', to: 'pdf' },
  { from: 'txt', to: 'docx' },
  { from: 'docx', to: 'html' },
  { from: 'docx', to: 'markdown' },
  { from: 'docx', to: 'txt' },
  { from: 'docx', to: 'pdf' },
  { from: 'pdf', to: 'txt' },
  { from: 'pdf', to: 'markdown' },
  { from: 'pdf', to: 'html' },
  { from: 'pdf', to: 'docx' },
  { from: 'jpg', to: 'png' },
  { from: 'jpg', to: 'webp' },
  { from: 'jpg', to: 'pdf' },
  { from: 'png', to: 'jpg' },
  { from: 'png', to: 'webp' },
  { from: 'png', to: 'pdf' },
  { from: 'webp', to: 'jpg' },
  { from: 'webp', to: 'png' },
  { from: 'webp', to: 'pdf' },
  { from: 'mp4', to: 'mp3' },
]

const FEATURED_RECIPES = [
  {
    id: 'jpg-pdf',
    from: 'jpg',
    to: 'pdf',
    title: 'JPG to PDF',
    description: 'Package a single image into a PDF without leaving the browser.',
  },
  {
    id: 'mp4-mp3',
    from: 'mp4',
    to: 'mp3',
    title: 'MP4 to MP3',
    description: 'Extract the audio track from an uploaded MP4 and download it as MP3.',
  },
  {
    id: 'png-jpg',
    from: 'png',
    to: 'jpg',
    title: 'Image Converter',
    description: 'Convert common browser-friendly image formats between JPG, PNG, and WEBP.',
  },
  {
    id: 'csv-json',
    from: 'csv',
    to: 'json',
    title: 'Spreadsheet to JSON',
    description: 'Turn flat rows into structured data for APIs and internal tools.',
  },
  {
    id: 'markdown-pdf',
    from: 'markdown',
    to: 'pdf',
    title: 'Notes to PDF',
    description: 'Export release notes, briefs, and checklists as a document people can share.',
  },
  {
    id: 'html-docx',
    from: 'html',
    to: 'docx',
    title: 'HTML to DOCX',
    description: 'Turn web copy into something teammates can edit in Word.',
  },
  {
    id: 'docx-html',
    from: 'docx',
    to: 'html',
    title: 'DOCX to HTML',
    description: 'Extract browser-friendly markup from a Word document upload.',
  },
  {
    id: 'docx-markdown',
    from: 'docx',
    to: 'markdown',
    title: 'DOCX to Markdown',
    description: 'Pull content out of Word and move it into docs workflows quickly.',
  },
  {
    id: 'pdf-txt',
    from: 'pdf',
    to: 'txt',
    title: 'PDF to text',
    description: 'Extract readable text from text-based PDFs directly in the browser.',
  },
  {
    id: 'pdf-docx',
    from: 'pdf',
    to: 'docx',
    title: 'PDF to DOCX',
    description: 'Take extracted PDF text and repackage it into an editable Word file.',
  },
  {
    id: 'txt-docx',
    from: 'txt',
    to: 'docx',
    title: 'Plain text to DOCX',
    description: 'Package notes, logs, and transcripts into a portable document file.',
  },
]

const SAMPLE_INPUTS = {
  csv: `name,email,plan
Harper,harper@northstar.io,Pro
Mina,mina@northstar.io,Starter
Leo,leo@northstar.io,Enterprise`,
  json: `[
  {
    "name": "Harper",
    "email": "harper@northstar.io",
    "plan": "Pro"
  },
  {
    "name": "Mina",
    "email": "mina@northstar.io",
    "plan": "Starter"
  }
]`,
  markdown: `# Launch checklist

- Confirm the release notes
- Send the customer email
- Update the status page

Visit [the dashboard](https://example.com) once the rollout starts.`,
  html: `<article>
  <h1>Launch checklist</h1>
  <p>Confirm the release notes before the rollout starts.</p>
  <ul>
    <li>Send the customer email</li>
    <li>Update the status page</li>
  </ul>
</article>`,
  txt: `Launch checklist

Confirm the release notes before the rollout starts.
Send the customer email.
Update the status page.`,
}

const FEATURE_PANELS = [
  {
    eyebrow: 'Private by default',
    title: 'Runs in the browser',
    body: 'Text-based work stays client-side, including DOCX parsing and PDF text extraction for supported files.',
  },
  {
    eyebrow: 'Useful on day one',
    title: 'Covers more real workflows',
    body: 'CSV, JSON, Markdown, HTML, TXT, DOCX, and PDF give the site a broader, more believable product surface.',
  },
  {
    eyebrow: 'Built to grow',
    title: 'Ready for heavier formats later',
    body: 'The conversion flow now separates text extraction from export, which makes future media and office formats easier to add.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Paste or upload',
    body: 'Text formats can be typed directly, while DOCX and PDF sources are loaded from file upload.',
  },
  {
    number: '02',
    title: 'Choose the target',
    body: 'The target list is filtered by what each source format can actually produce in this version.',
  },
  {
    number: '03',
    title: 'Preview and export',
    body: 'Text outputs render directly, and PDF or DOCX targets generate real downloadable files on demand.',
  },
]

const VALUE_POINTS = [
  {
    title: 'Focused format support',
    body: 'Built around practical document and text conversions instead of a generic placeholder feature list.',
  },
  {
    title: 'Private for current workflows',
    body: 'DOCX parsing, PDF text extraction, previewing, and export generation all run in the browser for supported flows.',
  },
  {
    title: 'Quality-first output',
    body: 'The app previews extracted content before download so people can catch formatting problems early.',
  },
  {
    title: 'Expandable foundation',
    body: 'The format directory now includes browser-side document, image, and a first media workflow, with room for OCR and heavier pipelines later.',
  },
]

const DIRECTORY_GROUPS = [
  {
    title: 'Video & Audio',
    description: 'A first browser-side media route is live, with broader audio and video support still planned.',
    items: [
      { label: 'Video Converter', status: 'planned' },
      { label: 'Audio Converter', status: 'planned' },
      { label: 'MP3 Converter', status: 'planned' },
      { label: 'MP4 to MP3', from: 'mp4', to: 'mp3', status: 'live' },
      { label: 'Video to MP3', status: 'planned' },
      { label: 'MOV to MP4', status: 'planned' },
      { label: 'MP3 to OGG', status: 'planned' },
    ],
  },
  {
    title: 'Image',
    description: 'Browser-friendly image routes now work for JPG, PNG, WEBP, and PDF packaging.',
    items: [
      { label: 'Image Converter', from: 'png', to: 'jpg', status: 'live' },
      { label: 'WEBP to PNG', from: 'webp', to: 'png', status: 'live' },
      { label: 'JFIF to PNG', from: 'jpg', to: 'png', status: 'live' },
      { label: 'PNG to SVG', status: 'planned' },
      { label: 'HEIC to JPG', status: 'planned' },
      { label: 'HEIC to PNG', status: 'planned' },
      { label: 'WEBP to JPG', from: 'webp', to: 'jpg', status: 'live' },
      { label: 'SVG Converter', status: 'planned' },
    ],
  },
  {
    title: 'PDF & Documents',
    description: 'These routes are wired to the current browser-based document converter where possible.',
    items: [
      { label: 'PDF Converter', from: 'pdf', to: 'txt', status: 'live' },
      { label: 'Document Converter', from: 'docx', to: 'html', status: 'live' },
      { label: 'Ebook Converter', status: 'planned' },
      { label: 'PDF to Word', from: 'pdf', to: 'docx', status: 'live' },
      { label: 'PDF to HTML', from: 'pdf', to: 'html', status: 'live' },
      { label: 'PDF to Markdown', from: 'pdf', to: 'markdown', status: 'live' },
      { label: 'DOCX to PDF', from: 'docx', to: 'pdf', status: 'live' },
      { label: 'JPG to PDF', from: 'jpg', to: 'pdf', status: 'live' },
    ],
  },
]

const FOOTER_LINK_GROUPS = [
  {
    title: 'Company',
    links: ['About', 'Security', 'Status'],
  },
  {
    title: 'Resources',
    links: ['Format guide', 'API roadmap', 'Changelog'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Contact'],
  },
]

let mammothLoader
let pdfjsLoader
let docxLoader
let jsPdfLoader
let lameJsLoader

async function loadMammoth() {
  if (!mammothLoader) {
    mammothLoader = import('mammoth').then((module) => module.default ?? module)
  }

  return mammothLoader
}

async function loadPdfJs() {
  if (!pdfjsLoader) {
    pdfjsLoader = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjsModule, workerModule]) => {
      const pdfjs = pdfjsModule.default ?? pdfjsModule
      pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default ?? workerModule
      return pdfjs
    })
  }

  return pdfjsLoader
}

async function loadDocx() {
  if (!docxLoader) {
    docxLoader = import('docx')
  }

  return docxLoader
}

async function loadJsPdf() {
  if (!jsPdfLoader) {
    jsPdfLoader = import('jspdf').then((module) => module.jsPDF)
  }

  return jsPdfLoader
}

async function loadLameJs() {
  if (!lameJsLoader) {
    lameJsLoader = import('lamejs').then((module) => module.default ?? module)
  }

  return lameJsLoader
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }

      continue
    }

    if (character === ',' && !insideQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += character
  }

  values.push(current)
  return values
}

function csvToJson(input) {
  const lines = input
    .replaceAll('\r\n', '\n')
    .split('\n')
    .filter((line) => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV input needs a header row and at least one data row.')
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())

  if (headers.some((header) => header === '')) {
    throw new Error('CSV headers cannot be empty.')
  }

  const rows = lines.slice(1).map((line) => parseCsvLine(line))
  const data = rows.map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = row[index] ?? ''
      return record
    }, {}),
  )

  return JSON.stringify(data, null, 2)
}

function flattenObject(value, prefix = '', result = {}) {
  if (value === null || value === undefined) {
    result[prefix] = ''
    return result
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    result[prefix] = Array.isArray(value) ? JSON.stringify(value) : String(value)
    return result
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    const nestedKey = prefix ? `${prefix}.${key}` : key
    flattenObject(nestedValue, nestedKey, result)
  })

  return result
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? '')

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

function jsonToCsv(input) {
  let parsed

  try {
    parsed = JSON.parse(input)
  } catch {
    throw new Error('JSON input is invalid.')
  }

  const rows = Array.isArray(parsed) ? parsed : [parsed]

  if (rows.length === 0) {
    throw new Error('JSON input is empty.')
  }

  if (rows.some((row) => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('JSON to CSV needs an object or an array of objects.')
  }

  const flattenedRows = rows.map((row) => flattenObject(row))
  const headers = [...new Set(flattenedRows.flatMap((row) => Object.keys(row)))]

  const csvRows = [
    headers.join(','),
    ...flattenedRows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header] ?? '')).join(','),
    ),
  ]

  return csvRows.join('\n')
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function markdownToHtml(input) {
  const lines = input.replaceAll('\r\n', '\n').split('\n')
  const fragments = []
  const paragraph = []
  const quote = []
  let listType = ''
  let insideCodeBlock = false
  let codeBuffer = []

  function flushParagraph() {
    if (!paragraph.length) {
      return
    }

    fragments.push(`<p>${formatInlineMarkdown(paragraph.join(' '))}</p>`)
    paragraph.length = 0
  }

  function flushQuote() {
    if (!quote.length) {
      return
    }

    fragments.push(`<blockquote><p>${formatInlineMarkdown(quote.join(' '))}</p></blockquote>`)
    quote.length = 0
  }

  function closeList() {
    if (!listType) {
      return
    }

    fragments.push(`</${listType}>`)
    listType = ''
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flushParagraph()
      flushQuote()
      closeList()

      if (insideCodeBlock) {
        fragments.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`)
        codeBuffer = []
      }

      insideCodeBlock = !insideCodeBlock
      return
    }

    if (insideCodeBlock) {
      codeBuffer.push(line)
      return
    }

    if (!trimmed) {
      flushParagraph()
      flushQuote()
      closeList()
      return
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)

    if (headingMatch) {
      flushParagraph()
      flushQuote()
      closeList()
      const level = headingMatch[1].length
      fragments.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`)
      return
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/)

    if (quoteMatch) {
      flushParagraph()
      closeList()
      quote.push(quoteMatch[1])
      return
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/)

    if (orderedMatch) {
      flushParagraph()
      flushQuote()

      if (listType !== 'ol') {
        closeList()
        listType = 'ol'
        fragments.push('<ol>')
      }

      fragments.push(`<li>${formatInlineMarkdown(orderedMatch[1])}</li>`)
      return
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/)

    if (unorderedMatch) {
      flushParagraph()
      flushQuote()

      if (listType !== 'ul') {
        closeList()
        listType = 'ul'
        fragments.push('<ul>')
      }

      fragments.push(`<li>${formatInlineMarkdown(unorderedMatch[1])}</li>`)
      return
    }

    flushQuote()
    closeList()
    paragraph.push(trimmed)
  })

  if (insideCodeBlock) {
    throw new Error('Markdown code block is not closed.')
  }

  flushParagraph()
  flushQuote()
  closeList()

  return fragments.join('\n')
}

function inlineHtmlToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\s+/g, ' ') ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const content = Array.from(node.childNodes)
    .map((child) => inlineHtmlToMarkdown(child))
    .join('')

  switch (node.tagName.toLowerCase()) {
    case 'strong':
    case 'b':
      return `**${content.trim()}**`
    case 'em':
    case 'i':
      return `*${content.trim()}*`
    case 'code':
      return `\`${(node.textContent ?? '').trim()}\``
    case 'a': {
      const href = node.getAttribute('href') ?? '#'
      const label = content.trim() || href
      return `[${label}](${href})`
    }
    case 'br':
      return '\n'
    default:
      return content
  }
}

function blockHtmlToMarkdown(node, orderedIndex = 1) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\s+/g, ' ') ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const tagName = node.tagName.toLowerCase()
  const inlineContent = Array.from(node.childNodes)
    .map((child) => inlineHtmlToMarkdown(child))
    .join('')
    .trim()

  switch (tagName) {
    case 'h1':
      return `# ${inlineContent}\n\n`
    case 'h2':
      return `## ${inlineContent}\n\n`
    case 'h3':
      return `### ${inlineContent}\n\n`
    case 'h4':
      return `#### ${inlineContent}\n\n`
    case 'h5':
      return `##### ${inlineContent}\n\n`
    case 'h6':
      return `###### ${inlineContent}\n\n`
    case 'p':
      return `${inlineContent}\n\n`
    case 'pre':
      return `\`\`\`\n${(node.textContent ?? '').trim()}\n\`\`\`\n\n`
    case 'blockquote': {
      const lines = inlineContent
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `> ${line}`)
      return `${lines.join('\n')}\n\n`
    }
    case 'ul': {
      const items = Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === 'li')
        .map((child) => `- ${inlineHtmlToMarkdown(child).trim()}`)
      return `${items.join('\n')}\n\n`
    }
    case 'ol': {
      const items = Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === 'li')
        .map((child, index) => `${orderedIndex + index}. ${inlineHtmlToMarkdown(child).trim()}`)
      return `${items.join('\n')}\n\n`
    }
    case 'li':
      return `${inlineContent}\n`
    case 'article':
    case 'section':
    case 'main':
    case 'div':
    case 'body':
      return `${Array.from(node.childNodes)
        .map((child) => blockHtmlToMarkdown(child))
        .join('')}\n`
    default:
      return `${inlineContent}\n\n`
  }
}

function cleanupMarkdown(input) {
  return input
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function htmlToMarkdown(input) {
  const parser = new DOMParser()
  const document = parser.parseFromString(input, 'text/html')
  const markdown = Array.from(document.body.childNodes)
    .map((node) => blockHtmlToMarkdown(node))
    .join('')

  return cleanupMarkdown(markdown)
}

function htmlToText(input) {
  const parser = new DOMParser()
  const document = parser.parseFromString(input, 'text/html')

  return document.body.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? ''
}

function textToHtml(input) {
  const paragraphs = input
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    throw new Error('Text input is empty.')
  }

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('\n')
}

function plainTextToMarkdown(input) {
  return input
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n\n')
}

function buildCodeBlockMarkdown(language, input) {
  return `\`\`\`${language}\n${input.trim()}\n\`\`\``
}

function buildPreformattedHtml(title, input) {
  return `<article>
  <h1>${escapeHtml(title)}</h1>
  <pre>${escapeHtml(input.trim())}</pre>
</article>`
}

function formatBytes(byteLength) {
  if (!byteLength) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(byteLength) / Math.log(1024)), units.length - 1)
  const value = byteLength / 1024 ** unitIndex

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function getObjectUrlFromBytes(sourceBytes, mimeType) {
  return URL.createObjectURL(new Blob([sourceBytes], { type: mimeType }))
}

function inferImageMimeType(format) {
  return MIME_TYPES[format] || 'application/octet-stream'
}

async function loadImageFromBytes(sourceBytes, format) {
  const objectUrl = getObjectUrlFromBytes(sourceBytes, inferImageMimeType(format))

  try {
    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image()
      nextImage.onload = () => resolve(nextImage)
      nextImage.onerror = () => reject(new Error('This image file could not be decoded.'))
      nextImage.src = objectUrl
    })

    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function getImageMetadata(sourceBytes, format) {
  const image = await loadImageFromBytes(sourceBytes, format)

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  }
}

async function convertImageBlob(sourceBytes, sourceFormat, targetFormat) {
  const image = await loadImageFromBytes(sourceBytes, sourceFormat)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas is not available in this browser.')
  }

  if (targetFormat === 'jpg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.drawImage(image, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The image could not be converted.'))
        return
      }

      resolve(blob)
    }, inferImageMimeType(targetFormat), targetFormat === 'jpg' ? 0.92 : undefined)
  })
}

async function getVideoMetadata(sourceBytes) {
  const objectUrl = getObjectUrlFromBytes(sourceBytes, MIME_TYPES.mp4)

  try {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = objectUrl

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('This MP4 file could not be read for metadata.'))
    })

    return {
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      width: video.videoWidth,
      height: video.videoHeight,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function formatDuration(seconds) {
  if (!seconds) {
    return '0:00'
  }

  const totalSeconds = Math.round(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function float32ToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length)

  for (let index = 0; index < float32Array.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[index]))
    int16Array[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }

  return int16Array
}

async function convertMp4ToMp3Blob(sourceBytes) {
  const lamejs = await loadLameJs()
  const AudioContextClass = window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) {
    throw new Error('Audio conversion is not supported in this browser.')
  }

  const audioContext = new AudioContextClass()

  try {
    const audioBuffer = await audioContext.decodeAudioData(sourceBytes.slice().buffer)
    const channelCount = Math.min(audioBuffer.numberOfChannels, 2)
    const encoder = new lamejs.Mp3Encoder(channelCount, audioBuffer.sampleRate, 128)
    const leftChannel = audioBuffer.getChannelData(0)
    const rightChannel = channelCount > 1 ? audioBuffer.getChannelData(1) : null
    const blockSize = 1152
    const mp3Chunks = []

    for (let index = 0; index < leftChannel.length; index += blockSize) {
      const leftChunk = float32ToInt16(leftChannel.subarray(index, index + blockSize))
      const encodedChunk =
        channelCount > 1 && rightChannel
          ? encoder.encodeBuffer(leftChunk, float32ToInt16(rightChannel.subarray(index, index + blockSize)))
          : encoder.encodeBuffer(leftChunk)

      if (encodedChunk.length) {
        mp3Chunks.push(new Uint8Array(encodedChunk))
      }
    }

    const flushChunk = encoder.flush()

    if (flushChunk.length) {
      mp3Chunks.push(new Uint8Array(flushChunk))
    }

    return new Blob(mp3Chunks, { type: MIME_TYPES.mp3 })
  } catch {
    throw new Error('This MP4 file could not be converted to MP3 in the browser.')
  } finally {
    await audioContext.close()
  }
}

async function extractPdfText(sourceBytes) {
  const pdfjs = await loadPdfJs()
  const loadingTask = pdfjs.getDocument({ data: sourceBytes.slice() })
  const pdf = await loadingTask.promise
  const pages = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const chunks = []

    textContent.items.forEach((item) => {
      const text = typeof item.str === 'string' ? item.str : ''

      if (!text) {
        if (item.hasEOL) {
          chunks.push('\n')
        }

        return
      }

      chunks.push(text)

      if (item.hasEOL) {
        chunks.push('\n')
      } else {
        chunks.push(' ')
      }
    })

    const pageText = chunks.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

    if (pageText) {
      pages.push(pageText)
    }
  }

  return pages.join('\n\n')
}

async function buildRichContent(sourceFormat, inputText, sourceBytes) {
  const trimmedInput = inputText.trim()

  if (sourceFormat === 'docx') {
    if (!sourceBytes) {
      return null
    }

    const mammoth = await loadMammoth()
    const arrayBuffer = sourceBytes.slice().buffer

    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml({ arrayBuffer }),
      mammoth.extractRawText({ arrayBuffer: sourceBytes.slice().buffer }),
    ])

    const html = htmlResult.value.trim()
    const text = textResult.value.trim() || htmlToText(html)
    const markdown = html ? htmlToMarkdown(html) : plainTextToMarkdown(text)

    return { text, html, markdown }
  }

  if (sourceFormat === 'pdf') {
    if (!sourceBytes) {
      return null
    }

    const text = (await extractPdfText(sourceBytes)).trim()

    if (!text) {
      throw new Error('This PDF did not expose readable text. Scanned PDFs usually need OCR.')
    }

    return {
      text,
      html: textToHtml(text),
      markdown: plainTextToMarkdown(text),
    }
  }

  if (IMAGE_FORMATS.has(sourceFormat)) {
    if (!sourceBytes) {
      return null
    }

    const metadata = await getImageMetadata(sourceBytes, sourceFormat)

    return {
      text: `${getFormatLabel(sourceFormat)} image loaded\n${metadata.width} x ${metadata.height}px\n${formatBytes(sourceBytes.byteLength)}`,
      imageFormat: sourceFormat,
      sourceBytes,
      ...metadata,
    }
  }

  if (sourceFormat === 'mp4') {
    if (!sourceBytes) {
      return null
    }

    const metadata = await getVideoMetadata(sourceBytes)

    return {
      text: `MP4 video loaded\nDuration ${formatDuration(metadata.duration)}\n${metadata.width} x ${metadata.height}px\n${formatBytes(sourceBytes.byteLength)}`,
      mediaFormat: sourceFormat,
      sourceBytes,
      ...metadata,
    }
  }

  if (!trimmedInput) {
    return null
  }

  if (sourceFormat === 'csv') {
    return {
      text: trimmedInput,
      html: buildPreformattedHtml('CSV preview', trimmedInput),
      markdown: buildCodeBlockMarkdown('csv', trimmedInput),
    }
  }

  if (sourceFormat === 'json') {
    return {
      text: trimmedInput,
      html: buildPreformattedHtml('JSON preview', trimmedInput),
      markdown: buildCodeBlockMarkdown('json', trimmedInput),
    }
  }

  if (sourceFormat === 'markdown') {
    const html = markdownToHtml(inputText)

    return {
      text: htmlToText(html),
      html,
      markdown: cleanupMarkdown(inputText),
    }
  }

  if (sourceFormat === 'html') {
    return {
      text: htmlToText(inputText),
      html: trimmedInput,
      markdown: htmlToMarkdown(inputText),
    }
  }

  if (sourceFormat === 'txt') {
    return {
      text: trimmedInput,
      html: textToHtml(inputText),
      markdown: plainTextToMarkdown(inputText),
    }
  }

  return null
}

function convertToTextTarget(sourceFormat, targetFormat, inputText, richContent) {
  if (sourceFormat === 'csv' && targetFormat === 'json') {
    return csvToJson(inputText)
  }

  if (sourceFormat === 'json' && targetFormat === 'csv') {
    return jsonToCsv(inputText)
  }

  if (targetFormat === 'txt') {
    return richContent.text
  }

  if (IMAGE_FORMATS.has(targetFormat)) {
    return `${richContent.text}\n\nOutput will be generated as ${getFormatLabel(targetFormat)}.`
  }

  if (targetFormat === 'html') {
    return richContent.html
  }

  if (targetFormat === 'markdown') {
    return richContent.markdown
  }

  if (targetFormat === 'pdf' || targetFormat === 'docx') {
    if (richContent.imageFormat) {
      return `${richContent.text}\n\nOutput will be packaged as a PDF document.`
    }

    return richContent.text
  }

  if (targetFormat === 'mp3') {
    return `${richContent.text}\n\nAudio will be extracted and encoded as MP3 during download.`
  }

  throw new Error('That conversion path is not supported yet.')
}

function markdownToDocxParagraphs(markdown, docxModule) {
  const { HeadingLevel, Paragraph } = docxModule
  const blocks = markdown
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (!blocks.length) {
    return [new Paragraph('')]
  }

  return blocks.flatMap((block) => {
    const lines = block.split('\n').map((line) => line.trim())
    const headingMatch = lines[0].match(/^(#{1,6})\s+(.*)$/)

    if (headingMatch) {
      const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      }

      return [
        new Paragraph({
          text: headingMatch[2],
          heading: headingMap[headingMatch[1].length],
        }),
      ]
    }

    if (lines.every((line) => /^[-*+]\s+/.test(line))) {
      return lines.map(
        (line) =>
          new Paragraph({
            text: line.replace(/^[-*+]\s+/, ''),
            bullet: { level: 0 },
          }),
      )
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return lines.map((line) => new Paragraph(line))
    }

    return [new Paragraph(lines.join(' '))]
  })
}

async function buildDocxBlob(richContent) {
  const docxModule = await loadDocx()
  const { Document, Packer } = docxModule
  const markdown = richContent.markdown || plainTextToMarkdown(richContent.text)
  const document = new Document({
    sections: [
      {
        children: markdownToDocxParagraphs(markdown, docxModule),
      },
    ],
  })

  return Packer.toBlob(document)
}

async function buildPdfBlob(richContent) {
  const jsPDF = await loadJsPdf()

  if (richContent.imageFormat && richContent.sourceBytes) {
    const image = await loadImageFromBytes(richContent.sourceBytes, richContent.imageFormat)
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Canvas is not available in this browser.')
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    const orientation = image.naturalWidth >= image.naturalHeight ? 'landscape' : 'portrait'
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: 'a4',
    })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / image.naturalWidth, pageHeight / image.naturalHeight)
    const renderWidth = image.naturalWidth * ratio
    const renderHeight = image.naturalHeight * ratio
    const x = (pageWidth - renderWidth) / 2
    const y = (pageHeight - renderHeight) / 2

    pdf.addImage(dataUrl, 'JPEG', x, y, renderWidth, renderHeight)
    return pdf.output('blob')
  }

  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
  })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 48
  const lineHeight = 18
  const text = richContent.text || ' '
  const lines = pdf.splitTextToSize(text, pageWidth - margin * 2)
  let cursorY = margin

  pdf.setFont('times', 'normal')
  pdf.setFontSize(12)

  lines.forEach((line) => {
    if (cursorY > pageHeight - margin) {
      pdf.addPage()
      cursorY = margin
    }

    pdf.text(line || ' ', margin, cursorY)
    cursorY += lineHeight
  })

  return pdf.output('blob')
}

function triggerDownload(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(downloadUrl)
}

function inferFormatFromFileName(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (!extension) {
    return ''
  }

  if (extension === 'md') {
    return 'markdown'
  }

  if (extension === 'jpeg' || extension === 'jfif') {
    return 'jpg'
  }

  return FORMAT_OPTIONS.find((format) => format.value === extension)?.value ?? ''
}

function getAvailableTargets(sourceFormat) {
  return SUPPORTED_CONVERSIONS.filter((recipe) => recipe.from === sourceFormat).map((recipe) => recipe.to)
}

function getDefaultTarget(sourceFormat) {
  return getAvailableTargets(sourceFormat)[0] ?? ''
}

function getFormatLabel(formatValue) {
  return FORMAT_OPTIONS.find((option) => option.value === formatValue)?.label ?? formatValue
}

function getSourceDisplayValue(sourceFormat, uploadedFileName) {
  if (!BINARY_SOURCE_FORMATS.has(sourceFormat)) {
    return null
  }

  if (uploadedFileName) {
    return `Loaded ${uploadedFileName}.

This source stays as a binary file, and the converter prepares the output client-side before building the download.`
  }

  if (IMAGE_FORMATS.has(sourceFormat)) {
    return `Upload a ${getFormatLabel(sourceFormat)} file to start.

Image routes currently support JPG, PNG, and WEBP conversions plus image-to-PDF packaging.`
  }

  if (sourceFormat === 'mp4') {
    return `Upload an MP4 file to start.

The browser will decode the audio track locally and encode it as MP3 during download.`
  }

  return `Upload a ${getFormatLabel(sourceFormat)} file to start.

PDF extraction works best on text-based PDFs. Scanned PDFs usually need OCR before they can be converted reliably.`
}

function App() {
  const [sourceFormat, setSourceFormat] = useState('csv')
  const [targetFormat, setTargetFormat] = useState('json')
  const [inputText, setInputText] = useState(SAMPLE_INPUTS.csv)
  const [sourceBytes, setSourceBytes] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [conversionPreview, setConversionPreview] = useState('')
  const [richContent, setRichContent] = useState(null)
  const [conversionError, setConversionError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const availableTargets = getAvailableTargets(sourceFormat)
  const activeRecipeId = `${sourceFormat}-${targetFormat}`
  const isBinarySource = BINARY_SOURCE_FORMATS.has(sourceFormat)
  const isDocumentTarget = DOCUMENT_TARGET_FORMATS.has(targetFormat)
  const displayedInputValue = isBinarySource
    ? getSourceDisplayValue(sourceFormat, uploadedFileName)
    : inputText
  const errorMessage = uploadError || conversionError

  useEffect(() => {
    let cancelled = false

    const timerId = window.setTimeout(async () => {
      try {
        if (!cancelled) {
          setIsProcessing(true)
        }

        const nextRichContent = await buildRichContent(sourceFormat, inputText, sourceBytes)

        if (!nextRichContent) {
          if (!cancelled) {
            setRichContent(null)
            setConversionPreview('')
            setConversionError('')
          }

          return
        }

        const nextPreview = convertToTextTarget(sourceFormat, targetFormat, inputText, nextRichContent)

        if (!cancelled) {
          setRichContent(nextRichContent)
          setConversionPreview(nextPreview)
          setConversionError('')
        }
      } catch (error) {
        if (!cancelled) {
          setRichContent(null)
          setConversionPreview('')
          setConversionError(error.message || 'Conversion failed.')
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false)
        }
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timerId)
    }
  }, [inputText, sourceBytes, sourceFormat, targetFormat])

  function resetErrors() {
    setUploadError('')
    setConversionError('')
  }

  function switchSource(nextSource, nextTarget, options = {}) {
    const nextInput = options.inputText ?? SAMPLE_INPUTS[nextSource] ?? ''
    const nextFileName = options.uploadedFileName ?? ''
    const nextSourceBytes = options.sourceBytes ?? null

    resetErrors()
    setSourceFormat(nextSource)
    setTargetFormat(nextTarget)
    setUploadedFileName(nextFileName)
    setSourceBytes(nextSourceBytes)

    startTransition(() => {
      setInputText(nextInput)
    })
  }

  function handleSourceChange(nextSource) {
    const nextTargets = getAvailableTargets(nextSource)
    const nextTarget = nextTargets.includes(targetFormat) ? targetFormat : nextTargets[0]
    switchSource(nextSource, nextTarget, {
      inputText: BINARY_SOURCE_FORMATS.has(nextSource) ? '' : SAMPLE_INPUTS[nextSource] ?? '',
    })
  }

  function handleRecipeSelect(recipe) {
    switchSource(recipe.from, recipe.to, {
      inputText: BINARY_SOURCE_FORMATS.has(recipe.from) ? '' : SAMPLE_INPUTS[recipe.from] ?? '',
    })
  }

  function handleDirectorySelect(item) {
    if (item.status !== 'live') {
      return
    }

    handleRecipeSelect(item)
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleResetInput() {
    if (isBinarySource) {
      switchSource(sourceFormat, targetFormat, {
        inputText: '',
      })
      return
    }

    resetErrors()
    setUploadedFileName('')
    setSourceBytes(null)
    startTransition(() => {
      setInputText(SAMPLE_INPUTS[sourceFormat] ?? '')
    })
  }

  async function handleDownload() {
    if (!richContent || !conversionPreview) {
      return
    }

    setIsDownloading(true)

    try {
      const baseName = uploadedFileName
        ? uploadedFileName.replace(/\.[^.]+$/, '')
        : `${sourceFormat}-converted`

      if (targetFormat === 'docx') {
        const blob = await buildDocxBlob(richContent)
        triggerDownload(blob, `${baseName}.docx`)
        return
      }

      if (targetFormat === 'pdf') {
        const blob = await buildPdfBlob(richContent)
        triggerDownload(blob, `${baseName}.pdf`)
        return
      }

      if (IMAGE_FORMATS.has(targetFormat) && richContent.sourceBytes) {
        const blob = await convertImageBlob(richContent.sourceBytes, sourceFormat, targetFormat)
        triggerDownload(blob, `${baseName}.${FORMAT_EXTENSIONS[targetFormat]}`)
        return
      }

      if (targetFormat === 'mp3' && richContent.sourceBytes) {
        const blob = await convertMp4ToMp3Blob(richContent.sourceBytes)
        triggerDownload(blob, `${baseName}.mp3`)
        return
      }

      const blob = new Blob([conversionPreview], { type: MIME_TYPES[targetFormat] })
      triggerDownload(blob, `${baseName}.${FORMAT_EXTENSIONS[targetFormat]}`)
    } finally {
      setIsDownloading(false)
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const inferredFormat = inferFormatFromFileName(file.name)
    const nextSource = inferredFormat || sourceFormat
    const nextTargets = getAvailableTargets(nextSource)
    const nextTarget = nextTargets.includes(targetFormat) ? targetFormat : getDefaultTarget(nextSource)
    const reader = new FileReader()

    resetErrors()

    reader.onload = () => {
      if (BINARY_SOURCE_FORMATS.has(nextSource)) {
        switchSource(nextSource, nextTarget, {
          inputText: '',
          uploadedFileName: file.name,
          sourceBytes:
            reader.result instanceof ArrayBuffer ? new Uint8Array(reader.result).slice() : null,
        })
      } else {
        switchSource(nextSource, nextTarget, {
          inputText: typeof reader.result === 'string' ? reader.result : '',
          uploadedFileName: file.name,
          sourceBytes: null,
        })
      }
    }

    reader.onerror = () => {
      setUploadedFileName('')
      setSourceBytes(null)
      setUploadError('That file could not be read. Try another file or a supported text-based upload.')
    }

    if (BINARY_SOURCE_FORMATS.has(nextSource)) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }

    event.target.value = ''
  }

  return (
    <main className="site-shell">
      <section className="hero-shell">
        <div className="page-shell hero-shell-inner">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark">FC</span>
              <span className="brand-wordmark">fileconvert</span>
            </div>

            <nav className="topnav" aria-label="Primary">
              <a href="#directory">Tools</a>
              <a href="#workspace">Formats</a>
              <a href="#highlights">API</a>
              <a href="#footer">Pricing</a>
            </nav>

            <div className="account-links">
              <a href="#workspace">Sign Up</a>
              <a href="#workspace">Login</a>
            </div>
          </header>

          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow-row">
                <span className="eyebrow">File converter</span>
                <span className="eyebrow muted">Browser-based for current document workflows</span>
              </div>

              <h1>Convert the file you have into the format you actually need.</h1>
              <p className="hero-body">
                Convert common text, PDF, and document formats directly in the browser. Use the
                quick controls for the main conversion flow, then drop into the workspace for
                previewing, editing, and downloading.
              </p>

              <div className="hero-inline-form">
                <span className="hero-inline-label">convert</span>
                <select
                  className="hero-select"
                  value={sourceFormat}
                  onChange={(event) => handleSourceChange(event.target.value)}
                  aria-label="Source format"
                >
                  {FORMAT_OPTIONS.filter((option) =>
                    SUPPORTED_CONVERSIONS.some((recipe) => recipe.from === option.value),
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="hero-inline-label">to</span>
                <select
                  className="hero-select"
                  value={targetFormat}
                  onChange={(event) => {
                    resetErrors()
                    setTargetFormat(event.target.value)
                  }}
                  aria-label="Target format"
                >
                  {availableTargets.map((format) => (
                    <option key={format} value={format}>
                      {getFormatLabel(format)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hero-panel">
              <div className="hero-panel-metrics">
                <article className="metric-card">
                  <strong>{FORMAT_OPTIONS.length}</strong>
                  <span>formats live today</span>
                </article>
                <article className="metric-card">
                  <strong>{SUPPORTED_CONVERSIONS.length}</strong>
                  <span>available conversion paths</span>
                </article>
                <article className="metric-card">
                  <strong>Docs</strong>
                  <span>PDF and DOCX workflows included</span>
                </article>
              </div>

              <div className="hero-panel-note">
                <p className="panel-label">Current strength</p>
                <p>
                  Best for document-heavy conversions where people want a quick preview before they
                  download the result.
                </p>
              </div>
            </div>
          </section>

          <label className="hero-upload-cta">
            <input type="file" onChange={handleFileUpload} />
            <span className="cta-main">
              {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Select File'}
            </span>
            <span className="cta-meta">
              Supports documents, browser-friendly images, and MP4 to MP3 extraction
            </span>
          </label>
        </div>
      </section>

      <div className="page-shell page-content">
        <section className="directory-section" id="directory">
          <div className="directory-grid">
            {DIRECTORY_GROUPS.map((group) => (
              <article className="directory-column" key={group.title}>
                <div className="directory-head">
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>

                <div className="directory-list">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      className={`directory-link ${item.status === 'live' ? 'live' : 'planned'} ${
                        item.from && item.to && activeRecipeId === `${item.from}-${item.to}` ? 'active' : ''
                      }`}
                      type="button"
                      onClick={() => handleDirectorySelect(item)}
                    >
                      <span>{item.label}</span>
                      <small>{item.status === 'live' ? 'Available now' : 'Planned'}</small>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="workspace-section" id="workspace">
          <div className="workspace-header">
            <div>
              <p className="section-kicker">Workspace</p>
              <h2>Preview and export your conversion.</h2>
            </div>
            <span className="status-pill">
              {isDownloading ? 'Building file...' : isProcessing ? 'Converting...' : 'Ready'}
            </span>
          </div>

          <div className="workspace-grid">
            <aside className="workspace-sidebar">
              <div className="sidebar-panel">
                <p className="panel-label">Popular routes</p>
                <div className="recipe-list" aria-label="Suggested conversion recipes">
                  {FEATURED_RECIPES.map((recipe) => (
                    <button
                      key={recipe.id}
                      className={`recipe-chip ${activeRecipeId === recipe.id ? 'active' : ''}`}
                      type="button"
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <strong>{recipe.title}</strong>
                      <span>{recipe.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="studio" aria-label="Format conversion studio">
              <div className="control-grid">
                <label className="field">
                  <span>From</span>
                  <select value={sourceFormat} onChange={(event) => handleSourceChange(event.target.value)}>
                    {FORMAT_OPTIONS.filter((option) =>
                      SUPPORTED_CONVERSIONS.some((recipe) => recipe.from === option.value),
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>To</span>
                  <select
                    value={targetFormat}
                    onChange={(event) => {
                      resetErrors()
                      setTargetFormat(event.target.value)
                    }}
                  >
                    {availableTargets.map((format) => (
                      <option key={format} value={format}>
                        {getFormatLabel(format)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="upload-panel">
                <input type="file" onChange={handleFileUpload} />
                <span className="panel-label">Upload a file</span>
                <strong>{uploadedFileName || 'Choose a source file for this conversion'}</strong>
                <span>
                  DOCX uploads are parsed in-browser. Image routes support JPG, PNG, and WEBP.
                  PDF uploads still work best when the source already contains selectable text.
                </span>
              </label>

              <div className="editor-grid">
                <label className="editor-panel">
                  <span className="panel-label">Input</span>
                  <textarea
                    value={displayedInputValue}
                    onChange={(event) => {
                      if (isBinarySource) {
                        return
                      }

                      resetErrors()
                      setUploadedFileName('')
                      setSourceBytes(null)
                      setInputText(event.target.value)
                    }}
                    readOnly={isBinarySource}
                    spellCheck="false"
                    aria-label={`${getFormatLabel(sourceFormat)} input`}
                  />
                </label>

                <label className="editor-panel">
                  <span className="panel-label">
                    {isDocumentTarget ? `${getFormatLabel(targetFormat)} export preview` : 'Output'}
                  </span>
                  <textarea
                    value={conversionPreview}
                    readOnly
                    spellCheck="false"
                    aria-label={`${getFormatLabel(targetFormat)} output`}
                  />
                </label>
              </div>

              <div className="studio-footer">
                <button className="secondary-button" type="button" onClick={handleResetInput}>
                  {isBinarySource
                    ? `Reset ${getFormatLabel(sourceFormat)} upload`
                    : `Load ${getFormatLabel(sourceFormat)} example`}
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleDownload}
                  disabled={!conversionPreview || isProcessing || isDownloading}
                >
                  {isDownloading ? 'Preparing file...' : `Download ${getFormatLabel(targetFormat)}`}
                </button>
              </div>

              {errorMessage ? <p className="feedback error">{errorMessage}</p> : null}
              {!errorMessage && !conversionPreview ? (
                <p className="feedback">
                  {isBinarySource
                    ? `Upload a ${getFormatLabel(sourceFormat)} file to generate output.`
                    : 'Paste content or upload a supported file to generate output.'}
                </p>
              ) : null}
              {!errorMessage && conversionPreview && isDocumentTarget ? (
                <p className="feedback">
                  The preview shows the text content that will be packaged into the downloaded {getFormatLabel(targetFormat)} file.
                </p>
              ) : null}
            </section>
          </div>
        </section>

        <section className="highlights-section" id="highlights">
          <div className="value-grid">
            {VALUE_POINTS.map((point) => (
              <article className="value-card" key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="section-kicker">How it works</p>
            <h2>A practical flow for real file conversion tasks.</h2>
          </div>

          <div className="steps-grid">
            {STEPS.map((step) => (
              <article className="step-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer-block" id="footer">
          <div className="footer-links">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                {group.links.map((link) => (
                  <a href="#workspace" key={link}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <p className="footer-stat">
            Built to grow from the current {SUPPORTED_CONVERSIONS.length} browser-first conversion
            paths into a fuller hosted conversion service.
          </p>
        </footer>
      </div>
    </main>
  )
}

export default App
