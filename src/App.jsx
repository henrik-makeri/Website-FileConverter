import { startTransition, useEffect, useState } from 'react'
import './App.css'

// format list
const formatChoices = [
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

// lookups
const binaryInputFormats = new Set(['docx', 'pdf', 'jpg', 'png', 'webp', 'mp4', 'mp3'])
const downloadDocFormats = new Set(['docx', 'pdf'])
const browserImageFormats = new Set(['jpg', 'png', 'webp'])

// extension and mime lookups
const fileExtensionsByFormat = {
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

const mimeTypesByFormat = {
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

//main source of truth for what the browser can handle right now
const supportedRoutes = [
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

// featured routes for guiding people
const featuredRoutes = [
  {
    id: 'jpg-pdf',
    from: 'jpg',
    to: 'pdf',
    title: 'JPG to PDF',
    description: 'Throw one image in and get a PDF out without opening anything else.',
  },
  {
    id: 'mp4-mp3',
    from: 'mp4',
    to: 'mp3',
    title: 'MP4 to MP3',
    description: 'Pull the audio out of an MP4 and keep just the MP3.',
  },
  {
    id: 'png-jpg',
    from: 'png',
    to: 'jpg',
    title: 'Image Converter',
    description: 'Switch between JPG, PNG, and WEBP without doing anything fancy.',
  },
  {
    id: 'csv-json',
    from: 'csv',
    to: 'json',
    title: 'Spreadsheet to JSON',
    description: 'Turn rows and columns into something an app can actually use.',
  },
  {
    id: 'markdown-pdf',
    from: 'markdown',
    to: 'pdf',
    title: 'Notes to PDF',
    description: 'Good for notes, checklists, and stuff you just need to export fast.',
  },
  {
    id: 'html-docx',
    from: 'html',
    to: 'docx',
    title: 'HTML to DOCX',
    description: 'Take web copy and make it editable in Word.',
  },
  {
    id: 'docx-html',
    from: 'docx',
    to: 'html',
    title: 'DOCX to HTML',
    description: 'Pull the useful bits out of a Word doc and turn them into HTML.',
  },
  {
    id: 'docx-markdown',
    from: 'docx',
    to: 'markdown',
    title: 'DOCX to Markdown',
    description: 'Useful when something starts in Word and needs to end up in docs.',
  },
  {
    id: 'pdf-txt',
    from: 'pdf',
    to: 'txt',
    title: 'PDF to text',
    description: 'Grab the readable text out of a PDF right in the browser.',
  },
  {
    id: 'pdf-docx',
    from: 'pdf',
    to: 'docx',
    title: 'PDF to DOCX',
    description: 'Take PDF text and shove it back into something editable.',
  },
  {
    id: 'txt-docx',
    from: 'txt',
    to: 'docx',
    title: 'Plain text to DOCX',
    description: 'Wrap plain text up into a proper document when you need to send it on.',
  },
]

// something useful to show before anyone uploads a file
const demoInputs = {
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

const valueProps = [
  {
    title: 'Focused format support',
    body: 'Built around a smaller set of conversions that are actually useful.',
  },
  {
    title: 'Private for current workflows',
    body: 'Most of the current document flow stays in the browser.',
  },
  {
    title: 'Quality-first output',
    body: 'You can preview the result before downloading it.',
  },
  {
    title: 'Expandable foundation',
    body: 'The current setup leaves room to add more formats later.',
  },
]

const toolDirectoryGroups = [
  {
    title: 'Video & Audio',
    description: 'A few media entry points now lead into the MP4 to MP3 workflow, while the broader audio and video tools are still planned.',
    items: [
      { label: 'Video Converter', from: 'mp4', to: 'mp3', status: 'live' },
      { label: 'Audio Converter', from: 'mp4', to: 'mp3', status: 'live' },
      { label: 'MP3 Converter', from: 'mp4', to: 'mp3', status: 'live' },
      { label: 'MP4 to MP3', from: 'mp4', to: 'mp3', status: 'live' },
      { label: 'Video to MP3', from: 'mp4', to: 'mp3', status: 'live' },
      { label: 'MOV to MP4', status: 'planned' },
      { label: 'MP3 to OGG', status: 'planned' },
    ],
  },
  {
    title: 'Image',
    description: 'The image stuff here is the practical browser-friendly set: JPG, PNG, WEBP, and PDF packaging.',
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
    description: 'This is the part that feels the most complete right now, especially for document-heavy work.',
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

const footerLinkGroups = [
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

// lazy loaders keep the first page load lighter. later I may move these
let cachedMammothPromise
let cachedPdfJsPromise
let cachedDocxPromise
let cachedJsPdfPromise
let cachedLamePromise

async function getMammothLib() {
  if (!cachedMammothPromise) {
    cachedMammothPromise = import('mammoth').then((module) => module.default ?? module)
  }

  return cachedMammothPromise
}

async function getPdfJsLib() {
  if (!cachedPdfJsPromise) {
    cachedPdfJsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjsModule, workerModule]) => {
      const pdfjs = pdfjsModule.default ?? pdfjsModule
      pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default ?? workerModule
      return pdfjs
    })
  }

  return cachedPdfJsPromise
}

async function getDocxLib() {
  if (!cachedDocxPromise) {
    cachedDocxPromise = import('docx')
  }

  return cachedDocxPromise
}

async function getJsPdfLib() {
  if (!cachedJsPdfPromise) {
    cachedJsPdfPromise = import('jspdf').then((module) => module.jsPDF)
  }

  return cachedJsPdfPromise
}

async function getLameLib() {
  if (!cachedLamePromise) {
    cachedLamePromise = import('lamejs').then((module) => module.default ?? module)
  }

  return cachedLamePromise
}

// small helper
function escapeHtmlBits(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// CSV splitter
function splitCsvLine(line) {
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

// CSV -> JSON
function turnCsvIntoJson(input) {
  const lines = input
    .replaceAll('\r\n', '\n')
    .split('\n')
    .filter((line) => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV input needs a header row and at least one data row.')
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim())

  if (headers.some((header) => header === '')) {
    throw new Error('CSV headers cannot be empty.')
  }

  const rows = lines.slice(1).map((line) => splitCsvLine(line))
  const data = rows.map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = row[index] ?? ''
      return record
    }, {}),
  )

  return JSON.stringify(data, null, 2)
}

function flattenNestedObject(value, prefix = '', result = {}) {
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
    flattenNestedObject(nestedValue, nestedKey, result)
  })

  return result
}

function escapeCsvCell(value) {
  const stringValue = String(value ?? '')

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

// JSON into CSV
function turnJsonIntoCsv(input) {
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

  const flattenedRows = rows.map((row) => flattenNestedObject(row))
  const headers = [...new Set(flattenedRows.flatMap((row) => Object.keys(row)))]

  const csvRows = [
    headers.join(','),
    ...flattenedRows.map((row) =>
      headers.map((header) => escapeCsvCell(row[header] ?? '')).join(','),
    ),
  ]

  return csvRows.join('\n')
}

function renderInlineMarkdown(text) {
  return escapeHtmlBits(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

// markdown support
function turnMarkdownIntoHtml(input) {
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

    fragments.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`)
    paragraph.length = 0
  }

  function flushQuote() {
    if (!quote.length) {
      return
    }

    fragments.push(`<blockquote><p>${renderInlineMarkdown(quote.join(' '))}</p></blockquote>`)
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
        fragments.push(`<pre><code>${escapeHtmlBits(codeBuffer.join('\n'))}</code></pre>`)
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
      fragments.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`)
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

      fragments.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`)
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

      fragments.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`)
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

function inlineNodeToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\s+/g, ' ') ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const content = Array.from(node.childNodes)
    .map((child) => inlineNodeToMarkdown(child))
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

function blockNodeToMarkdown(node, orderedIndex = 1) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\s+/g, ' ') ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const tagName = node.tagName.toLowerCase()
  const inlineContent = Array.from(node.childNodes)
    .map((child) => inlineNodeToMarkdown(child))
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
        .map((child) => `- ${inlineNodeToMarkdown(child).trim()}`)
      return `${items.join('\n')}\n\n`
    }
    case 'ol': {
      const items = Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === 'li')
        .map((child, index) => `${orderedIndex + index}. ${inlineNodeToMarkdown(child).trim()}`)
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
        .map((child) => blockNodeToMarkdown(child))
        .join('')}\n`
    default:
      return `${inlineContent}\n\n`
  }
}

function tidyMarkdown(input) {
  return input
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// HTML, markdown still leans pragmatic over perfect, which is enough imo
function turnHtmlIntoMarkdown(input) {
  const parser = new DOMParser()
  const document = parser.parseFromString(input, 'text/html')
  const markdown = Array.from(document.body.childNodes)
    .map((node) => blockNodeToMarkdown(node))
    .join('')

  return tidyMarkdown(markdown)
}

function pullTextFromHtml(input) {
  const parser = new DOMParser()
  const document = parser.parseFromString(input, 'text/html')

  return document.body.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? ''
}

function turnPlainTextIntoHtml(input) {
  const paragraphs = input
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    throw new Error('Text input is empty.')
  }

  return paragraphs
    .map((paragraph) => `<p>${escapeHtmlBits(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('\n')
}

function turnPlainTextIntoMarkdown(input) {
  return input
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n\n')
}

function wrapAsCodeBlockMarkdown(language, input) {
  return `\`\`\`${language}\n${input.trim()}\n\`\`\``
}

function buildPreformattedPreviewHtml(title, input) {
  return `<article>
  <h1>${escapeHtmlBits(title)}</h1>
  <pre>${escapeHtmlBits(input.trim())}</pre>
</article>`
}

function formatByteSize(byteLength) {
  if (!byteLength) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(byteLength) / Math.log(1024)), units.length - 1)
  const value = byteLength / 1024 ** unitIndex

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function createObjectUrlFromBytes(uploadedBytes, mimeType) {
  return URL.createObjectURL(new Blob([uploadedBytes], { type: mimeType }))
}

function guessImageMimeType(format) {
  return mimeTypesByFormat[format] || 'application/octet-stream'
}

async function loadBrowserImageFromBytes(uploadedBytes, format) {
  const objectUrl = createObjectUrlFromBytes(uploadedBytes, guessImageMimeType(format))

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

async function readImageMetadata(uploadedBytes, format) {
  const image = await loadBrowserImageFromBytes(uploadedBytes, format)

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  }
}

async function convertImageToBlob(uploadedBytes, sourceKind, targetKind) {
  const image = await loadBrowserImageFromBytes(uploadedBytes, sourceKind)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas is not available in this browser.')
  }

  if (targetKind === 'jpg') {
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
    }, guessImageMimeType(targetKind), targetKind === 'jpg' ? 0.92 : undefined)
  })
}

async function readVideoMetadata(uploadedBytes) {
  const objectUrl = createObjectUrlFromBytes(uploadedBytes, mimeTypesByFormat.mp4)
  const video = document.createElement('video')

  try {
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
    video.src = ''
    URL.revokeObjectURL(objectUrl)
  }
}

function formatPlaybackTime(seconds) {
  if (!seconds) {
    return '0:00'
  }

  const totalSeconds = Math.round(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function convertFloat32ToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length)

  for (let index = 0; index < float32Array.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[index]))
    int16Array[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }

  return int16Array
}

async function convertMp4IntoMp3Blob(uploadedBytes) {
  const lamejs = await getLameLib()
  const AudioContextClass = window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) {
    throw new Error('Audio conversion is not supported in this browser.')
  }

  const audioContext = new AudioContextClass()

  try {
    const audioBuffer = await audioContext.decodeAudioData(uploadedBytes.slice().buffer)
    const channelCount = Math.min(audioBuffer.numberOfChannels, 2)
    const encoder = new lamejs.Mp3Encoder(channelCount, audioBuffer.sampleRate, 128)
    const leftChannel = audioBuffer.getChannelData(0)
    const rightChannel = channelCount > 1 ? audioBuffer.getChannelData(1) : null
    const blockSize = 1152
    const mp3Chunks = []

    for (let index = 0; index < leftChannel.length; index += blockSize) {
      const leftChunk = convertFloat32ToInt16(leftChannel.subarray(index, index + blockSize))
      const encodedChunk =
        channelCount > 1 && rightChannel
          ? encoder.encodeBuffer(leftChunk, convertFloat32ToInt16(rightChannel.subarray(index, index + blockSize)))
          : encoder.encodeBuffer(leftChunk)

      if (encodedChunk.length) {
        mp3Chunks.push(new Uint8Array(encodedChunk))
      }
    }

    const flushChunk = encoder.flush()

    if (flushChunk.length) {
      mp3Chunks.push(new Uint8Array(flushChunk))
    }

    return new Blob(mp3Chunks, { type: mimeTypesByFormat.mp3 })
  } catch (error) {
    console.error('MP4 to MP3 conversion error:', error)
    throw new Error('This MP4 file could not be converted to MP3 in the browser.')
  } finally {
    await audioContext.close()
  }
}

async function pullTextOutOfPdf(uploadedBytes) {
  const pdfjs = await getPdfJsLib()
  const loadingTask = pdfjs.getDocument({ data: uploadedBytes.slice() })
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

// converter normalizing each source into one snapshot object
async function buildSourceContentSnapshot(sourceKind, inputValue, uploadedBytes) {
  const trimmedInput = inputValue.trim()

  if (sourceKind === 'docx') {
    if (!uploadedBytes) {
      return null
    }

    const mammoth = await getMammothLib()
    const arrayBuffer = uploadedBytes.slice().buffer

    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml({ arrayBuffer }),
      mammoth.extractRawText({ arrayBuffer: uploadedBytes.slice().buffer }),
    ])

    const html = htmlResult.value.trim()
    const text = textResult.value.trim() || pullTextFromHtml(html)
    const markdown = html ? turnHtmlIntoMarkdown(html) : turnPlainTextIntoMarkdown(text)

    return { text, html, markdown }
  }

  if (sourceKind === 'pdf') {
    if (!uploadedBytes) {
      return null
    }

    const text = (await pullTextOutOfPdf(uploadedBytes)).trim()

    if (!text) {
      throw new Error('This PDF did not expose readable text. Scanned PDFs usually need OCR.')
    }

    return {
      text,
      html: turnPlainTextIntoHtml(text),
      markdown: turnPlainTextIntoMarkdown(text),
    }
  }

  if (browserImageFormats.has(sourceKind)) {
    if (!uploadedBytes) {
      return null
    }

    const metadata = await readImageMetadata(uploadedBytes, sourceKind)

    return {
      text: `${getFormatLabel(sourceKind)} image loaded\n${metadata.width} x ${metadata.height}px\n${formatByteSize(uploadedBytes.byteLength)}`,
      imageFormat: sourceKind,
      uploadedBytes,
      ...metadata,
    }
  }

  if (sourceKind === 'mp4') {
    if (!uploadedBytes) {
      return null
    }

    const metadata = await readVideoMetadata(uploadedBytes)

    return {
      text: `MP4 video loaded\nDuration ${formatPlaybackTime(metadata.duration)}\n${metadata.width} x ${metadata.height}px\n${formatByteSize(uploadedBytes.byteLength)}`,
      mediaFormat: sourceKind,
      uploadedBytes,
      ...metadata,
    }
  }

  if (!trimmedInput) {
    return null
  }

  if (sourceKind === 'csv') {
    return {
      text: trimmedInput,
      html: buildPreformattedPreviewHtml('CSV preview', trimmedInput),
      markdown: wrapAsCodeBlockMarkdown('csv', trimmedInput),
    }
  }

  if (sourceKind === 'json') {
    return {
      text: trimmedInput,
      html: buildPreformattedPreviewHtml('JSON preview', trimmedInput),
      markdown: wrapAsCodeBlockMarkdown('json', trimmedInput),
    }
  }

  if (sourceKind === 'markdown') {
    const html = turnMarkdownIntoHtml(inputValue)

    return {
      text: pullTextFromHtml(html),
      html,
      markdown: tidyMarkdown(inputValue),
    }
  }

  if (sourceKind === 'html') {
    return {
      text: pullTextFromHtml(inputValue),
      html: trimmedInput,
      markdown: turnHtmlIntoMarkdown(inputValue),
    }
  }

  if (sourceKind === 'txt') {
    return {
      text: trimmedInput,
      html: turnPlainTextIntoHtml(inputValue),
      markdown: turnPlainTextIntoMarkdown(inputValue),
    }
  }

  return null
}

function buildTextPreviewForTarget(sourceKind, targetKind, inputValue, contentSnapshot) {
  if (sourceKind === 'csv' && targetKind === 'json') {
    return turnCsvIntoJson(inputValue)
  }

  if (sourceKind === 'json' && targetKind === 'csv') {
    return turnJsonIntoCsv(inputValue)
  }

  if (targetKind === 'txt') {
    return contentSnapshot.text
  }

  if (browserImageFormats.has(targetKind)) {
    return `${contentSnapshot.text}\n\nOutput will be generated as ${getFormatLabel(targetKind)}.`
  }

  if (targetKind === 'html') {
    return contentSnapshot.html
  }

  if (targetKind === 'markdown') {
    return contentSnapshot.markdown
  }

  if (targetKind === 'pdf' || targetKind === 'docx') {
    if (contentSnapshot.imageFormat) {
      return `${contentSnapshot.text}\n\nOutput will be packaged as a PDF document.`
    }

    return contentSnapshot.text
  }

  if (targetKind === 'mp3') {
    return `${contentSnapshot.text}\n\nAudio will be extracted and encoded as MP3 during download.`
  }

  throw new Error('That conversion path is not supported yet.')
}

function markdownBlocksToDocxParagraphs(markdown, docxModule) {
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

//can restyle later
async function buildDocxDownloadBlob(contentSnapshot) {
  const docxModule = await getDocxLib()
  const { Document, Packer } = docxModule
  const markdown = contentSnapshot.markdown || turnPlainTextIntoMarkdown(contentSnapshot.text)
  const document = new Document({
    sections: [
      {
        children: markdownBlocksToDocxParagraphs(markdown, docxModule),
      },
    ],
  })

  return Packer.toBlob(document)
}

// PDF output
async function buildPdfDownloadBlob(contentSnapshot) {
  const jsPDF = await getJsPdfLib()

  if (contentSnapshot.imageFormat && contentSnapshot.uploadedBytes) {
    const image = await loadBrowserImageFromBytes(contentSnapshot.uploadedBytes, contentSnapshot.imageFormat)
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
  const text = contentSnapshot.text || ' '
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

function downloadBlobFile(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)

  try {
    link.click()
  } finally {
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  }
}

function guessFormatFromFileName(fileName) {
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

  return formatChoices.find((format) => format.value === extension)?.value ?? ''
}

function getTargetsForSource(sourceKind) {
  return supportedRoutes.filter((recipe) => recipe.from === sourceKind).map((recipe) => recipe.to)
}

function getDefaultTargetForSource(sourceKind) {
  return getTargetsForSource(sourceKind)[0] ?? ''
}

function getFormatLabel(formatValue) {
  return formatChoices.find((option) => option.value === formatValue)?.label ?? formatValue
}

function getSourceTextareaValue(sourceKind, uploadedName) {
  if (!binaryInputFormats.has(sourceKind)) {
    return null
  }

  if (uploadedName) {
    return `Loaded ${uploadedName}.

This source stays as a binary file, and the converter prepares the output client-side before building the download.`
  }

  if (browserImageFormats.has(sourceKind)) {
    return `Upload a ${getFormatLabel(sourceKind)} file to start.

Image routes currently support JPG, PNG, and WEBP conversions plus image-to-PDF packaging.`
  }

  if (sourceKind === 'mp4') {
    return `Upload an MP4 file to start.

The browser will decode the audio track locally and encode it as MP3 during download.`
  }

  return `Upload a ${getFormatLabel(sourceKind)} file to start.

PDF extraction works best on text-based PDFs. Scanned PDFs usually need OCR before they can be converted reliably.`
}

// this part is carrying a lot :D
function App() {
  const [sourceKind, setSourceFormat] = useState('csv')
  const [targetKind, setTargetFormat] = useState('json')
  const [inputValue, setInputText] = useState(demoInputs.csv)
  const [uploadedBytes, setSourceBytes] = useState(null)
  const [uploadedName, setUploadedFileName] = useState('')
  const [fileLoadError, setUploadError] = useState('')
  const [previewValue, setConversionPreview] = useState('')
  const [contentSnapshot, setRichContent] = useState(null)
  const [conversionIssue, setConversionError] = useState('')
  const [isConverting, setIsProcessing] = useState(false)
  const [isPreparingDownload, setIsDownloading] = useState(false)

  const targetOptions = getTargetsForSource(sourceKind)
  const activeRouteId = `${sourceKind}-${targetKind}`
  const isBinaryInput = binaryInputFormats.has(sourceKind)
  const isDocumentDownload = downloadDocFormats.has(targetKind)
  const shownInputValue = isBinaryInput
    ? getSourceTextareaValue(sourceKind, uploadedName)
    : inputValue
  const activeErrorMessage = fileLoadError || conversionIssue
  const previewDelayMs = uploadedBytes && isBinaryInput ? 300 : 0

  useEffect(() => {
    let cancelled = false

    const timerId = window.setTimeout(async () => {
      try {
        if (!cancelled) {
          setIsProcessing(true)
        }

        const nextRichContent = await buildSourceContentSnapshot(sourceKind, inputValue, uploadedBytes)

        if (!nextRichContent) {
          if (!cancelled) {
            setRichContent(null)
            setConversionPreview('')
            setConversionError('')
          }

          return
        }

        const nextPreview = buildTextPreviewForTarget(sourceKind, targetKind, inputValue, nextRichContent)

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
    }, previewDelayMs)

    return () => {
      cancelled = true
      window.clearTimeout(timerId)
    }
  }, [previewDelayMs, inputValue, uploadedBytes, sourceKind, targetKind])

  // keeping error cleanup in one place
  function clearErrors() {
    setUploadError('')
    setConversionError('')
  }

  // centralizing source changes
  function applySourceChange(nextSource, nextTarget, options = {}) {
    const nextInput = options.inputValue ?? demoInputs[nextSource] ?? ''
    const nextFileName = options.uploadedName ?? ''
    const nextSourceBytes = options.uploadedBytes ?? null

    clearErrors()
    setSourceFormat(nextSource)
    setTargetFormat(nextTarget)
    setUploadedFileName(nextFileName)
    setSourceBytes(nextSourceBytes)

    startTransition(() => {
      setInputText(nextInput)
    })
  }

  function onSourceChange(nextSource) {
    const nextTargets = getTargetsForSource(nextSource)
    const nextTarget = nextTargets.includes(targetKind) ? targetKind : nextTargets[0]
    applySourceChange(nextSource, nextTarget, {
      inputValue: binaryInputFormats.has(nextSource) ? '' : demoInputs[nextSource] ?? '',
    })
  }

  function onRouteSelect(recipe) {
    applySourceChange(recipe.from, recipe.to, {
      inputValue: binaryInputFormats.has(recipe.from) ? '' : demoInputs[recipe.from] ?? '',
    })
  }

  function onDirectoryItemSelect(item) {
    if (item.status !== 'live') {
      return
    }

    onRouteSelect(item)
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onResetInput() {
    if (isBinaryInput) {
      applySourceChange(sourceKind, targetKind, {
        inputValue: '',
      })
      return
    }

    clearErrors()
    setUploadedFileName('')
    setSourceBytes(null)
    startTransition(() => {
      setInputText(demoInputs[sourceKind] ?? '')
    })
  }

  // download logic
  async function onDownload() {
    if (!contentSnapshot || !previewValue) {
      return
    }

    setIsDownloading(true)

    try {
      const baseName = uploadedName
        ? uploadedName.replace(/\.[^.]+$/, '')
        : `${sourceKind}-converted`

      if (targetKind === 'docx') {
        const blob = await buildDocxDownloadBlob(contentSnapshot)
        downloadBlobFile(blob, `${baseName}.docx`)
        return
      }

      if (targetKind === 'pdf') {
        const blob = await buildPdfDownloadBlob(contentSnapshot)
        downloadBlobFile(blob, `${baseName}.pdf`)
        return
      }

      if (browserImageFormats.has(targetKind) && contentSnapshot.uploadedBytes) {
        const blob = await convertImageToBlob(contentSnapshot.uploadedBytes, sourceKind, targetKind)
        downloadBlobFile(blob, `${baseName}.${fileExtensionsByFormat[targetKind]}`)
        return
      }

      if (targetKind === 'mp3' && contentSnapshot.uploadedBytes) {
        const blob = await convertMp4IntoMp3Blob(contentSnapshot.uploadedBytes)
        downloadBlobFile(blob, `${baseName}.mp3`)
        return
      }

      const blob = new Blob([previewValue], { type: mimeTypesByFormat[targetKind] })
      downloadBlobFile(blob, `${baseName}.${fileExtensionsByFormat[targetKind]}`)
    } catch (error) {
      setConversionError(error.message || 'Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  function onFileUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const inferredFormat = guessFormatFromFileName(file.name)
    const nextSource = inferredFormat || sourceKind
    const nextTargets = getTargetsForSource(nextSource)
    const nextTarget = nextTargets.includes(targetKind) ? targetKind : getDefaultTargetForSource(nextSource)
    const reader = new FileReader()

    clearErrors()

    reader.onload = () => {
      if (binaryInputFormats.has(nextSource)) {
        applySourceChange(nextSource, nextTarget, {
          inputValue: '',
          uploadedName: file.name,
          uploadedBytes:
            reader.result instanceof ArrayBuffer ? new Uint8Array(reader.result).slice() : null,
        })
      } else {
        applySourceChange(nextSource, nextTarget, {
          inputValue: typeof reader.result === 'string' ? reader.result : '',
          uploadedName: file.name,
          uploadedBytes: null,
        })
      }
    }

    reader.onerror = () => {
      setUploadedFileName('')
      setSourceBytes(null)
      setUploadError('That file could not be read. Try another file or check the format.')
    }

    if (binaryInputFormats.has(nextSource)) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }

    event.target.value = ''
  }

  // UI
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
              </div>

              <h1>Convert your file.</h1>
              <p className="hero-body">
                This is a browser-first converter for:
                PDFs, DOCX files, plain text, images, and the odd MP4 to MP3 job.
              </p>

              <div className="hero-inline-form">
                <span className="hero-inline-label">convert</span>
                <select
                  className="hero-select"
                  value={sourceKind}
                  onChange={(event) => onSourceChange(event.target.value)}
                  aria-label="Source format"
                >
                  {formatChoices.filter((option) =>
                    supportedRoutes.some((recipe) => recipe.from === option.value),
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="hero-inline-label">to</span>
                <select
                  className="hero-select"
                  value={targetKind}
                  onChange={(event) => {
                    clearErrors()
                    setTargetFormat(event.target.value)
                  }}
                  aria-label="Target format"
                >
                  {targetOptions.map((format) => (
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
                  <strong>{formatChoices.length}</strong>
                  <span>formats live today</span>
                </article>
                <article className="metric-card">
                  <strong>Docs</strong>
                  <span>PDF and DOCX workflows included</span>
                </article>
              </div>

            </div>
          </section>

          <label className="hero-upload-cta">
            <input type="file" onChange={onFileUpload} />
            <span className="cta-main">
              {uploadedName ? `Picked: ${uploadedName}` : 'Pick a file'}
            </span>
            <span className="cta-meta">
              Documents, browser-friendly images, and one very handy MP4 to MP3 route
            </span>
          </label>
        </div>
      </section>

      <div className="page-shell page-content">
        <section className="directory-section" id="directory">
          <div className="directory-grid">
            {toolDirectoryGroups.map((group) => (
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
                        item.from && item.to && activeRouteId === `${item.from}-${item.to}` ? 'active' : ''
                      }`}
                      type="button"
                      onClick={() => onDirectoryItemSelect(item)}
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
              <h2>See the result, tweak if needed, then download it.</h2>
            </div>
            <span className="status-pill">
              {isPreparingDownload ? 'Building file...' : isConverting ? 'Converting...' : 'Ready'}
            </span>
          </div>

          <div className="workspace-grid">
            <aside className="workspace-sidebar">
              <div className="sidebar-panel">
                <p className="panel-label">Popular routes</p>
                <div className="recipe-list" aria-label="Suggested conversion recipes">
                  {featuredRoutes.map((recipe) => (
                    <button
                      key={recipe.id}
                      className={`recipe-chip ${activeRouteId === recipe.id ? 'active' : ''}`}
                      type="button"
                      onClick={() => onRouteSelect(recipe)}
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
                  <select value={sourceKind} onChange={(event) => onSourceChange(event.target.value)}>
                    {formatChoices.filter((option) =>
                      supportedRoutes.some((recipe) => recipe.from === option.value),
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
                    value={targetKind}
                    onChange={(event) => {
                      clearErrors()
                      setTargetFormat(event.target.value)
                    }}
                  >
                    {targetOptions.map((format) => (
                      <option key={format} value={format}>
                        {getFormatLabel(format)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="upload-panel">
                <input type="file" onChange={onFileUpload} />
                <span className="panel-label">Upload a file</span>
                <strong>{uploadedName || 'Drop in the file you want to work with'}</strong>
                <span>
                  DOCX gets parsed in-browser. Image routes work with JPG, PNG, and WEBP. PDFs
                  still behave best when the text is actually selectable.
                </span>
              </label>

              <div className="editor-grid">
                <label className="editor-panel">
                  <span className="panel-label">Input</span>
                  <textarea
                    value={shownInputValue}
                    onChange={(event) => {
                      if (isBinaryInput) {
                        return
                      }

                      clearErrors()
                      setUploadedFileName('')
                      setSourceBytes(null)
                      setInputText(event.target.value)
                    }}
                    readOnly={isBinaryInput}
                    spellCheck="false"
                    aria-label={`${getFormatLabel(sourceKind)} input`}
                  />
                </label>

                <label className="editor-panel">
                  <span className="panel-label">
                    {isDocumentDownload ? `${getFormatLabel(targetKind)} export preview` : 'Output'}
                  </span>
                  <textarea
                    value={previewValue}
                    readOnly
                    spellCheck="false"
                    aria-label={`${getFormatLabel(targetKind)} output`}
                  />
                </label>
              </div>

              <div className="studio-footer">
                <button className="secondary-button" type="button" onClick={onResetInput}>
                  {isBinaryInput
                    ? `Start over with ${getFormatLabel(sourceKind)}`
                    : `Load a ${getFormatLabel(sourceKind)} example`}
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={onDownload}
                  disabled={!previewValue || isConverting || isPreparingDownload}
                >
                  {isPreparingDownload ? 'Preparing file...' : `Download ${getFormatLabel(targetKind)}`}
                </button>
              </div>

              {activeErrorMessage ? <p className="feedback error">{activeErrorMessage}</p> : null}
              {!activeErrorMessage && !previewValue ? (
                <p className="feedback">
                  {isBinaryInput
                    ? `Upload a ${getFormatLabel(sourceKind)} file and the output will show up here.`
                    : 'Paste something in or upload a supported file to get started.'}
                </p>
              ) : null}
              {!activeErrorMessage && previewValue && isDocumentDownload ? (
                <p className="feedback">
                  This preview is the text that will get packed into the downloaded {getFormatLabel(targetKind)} file.
                </p>
              ) : null}
            </section>
          </div>
        </section>

        <section className="highlights-section" id="highlights">
          <div className="value-grid">
            {valueProps.map((point) => (
              <article className="value-card" key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer-block" id="footer">
          <div className="footer-links">
            {footerLinkGroups.map((group) => (
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
            Built to grow from the current {supportedRoutes.length} browser-first conversion
            paths into something bigger later. Built by Henrik Makeri.
          </p>
        </footer>
      </div>
    </main>
  )
}

export default App
