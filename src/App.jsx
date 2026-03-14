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
]

const BINARY_SOURCE_FORMATS = new Set(['docx', 'pdf'])
const DOCUMENT_TARGET_FORMATS = new Set(['docx', 'pdf'])

const FORMAT_EXTENSIONS = {
  csv: 'csv',
  json: 'json',
  markdown: 'md',
  html: 'html',
  txt: 'txt',
  docx: 'docx',
  pdf: 'pdf',
}

const MIME_TYPES = {
  csv: 'text/csv;charset=utf-8',
  json: 'application/json;charset=utf-8',
  markdown: 'text/markdown;charset=utf-8',
  html: 'text/html;charset=utf-8',
  txt: 'text/plain;charset=utf-8',
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
]

const FEATURED_RECIPES = [
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

let mammothLoader
let pdfjsLoader
let docxLoader
let jsPdfLoader

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

  if (targetFormat === 'html') {
    return richContent.html
  }

  if (targetFormat === 'markdown') {
    return richContent.markdown
  }

  if (targetFormat === 'pdf' || targetFormat === 'docx') {
    return richContent.text
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

This source stays as a binary document, and the converter extracts its content client-side before building the output.`
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
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow-row">
            <span className="eyebrow">Browser-first converter</span>
            <span className="eyebrow muted">Now handling DOCX and text-based PDF workflows too</span>
          </div>
          <h1>Turn files into the format your next step actually needs.</h1>
          <p className="hero-body">
            This version converts common text-based formats, extracts content from DOCX and PDF
            uploads, and exports real PDF or DOCX downloads directly from the browser.
          </p>

          <div className="hero-metrics">
            <div className="metric-card">
              <strong>{FORMAT_OPTIONS.length}</strong>
              <span>formats supported today</span>
            </div>
            <div className="metric-card">
              <strong>{SUPPORTED_CONVERSIONS.length}</strong>
              <span>conversion paths available</span>
            </div>
            <div className="metric-card">
              <strong>2</strong>
              <span>document formats added beyond the first pass</span>
            </div>
          </div>

          <div className="feature-grid">
            {FEATURE_PANELS.map((panel) => (
              <article className="feature-card" key={panel.title}>
                <p className="feature-eyebrow">{panel.eyebrow}</p>
                <h2>{panel.title}</h2>
                <p>{panel.body}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="studio" aria-label="Format conversion studio">
          <div className="studio-topbar">
            <div>
              <p className="panel-label">Format lab</p>
              <h2>Paste, upload, preview, and download</h2>
            </div>
            <span className="status-pill">
              {isDownloading ? 'Building file...' : isProcessing ? 'Converting...' : 'Live preview'}
            </span>
          </div>

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
            <strong>
              {uploadedFileName || 'Choose CSV, JSON, MD, HTML, TXT, DOCX, or PDF'}
            </strong>
            <span>
              DOCX uploads are converted with browser-side parsing. PDF uploads work best when the
              PDF already contains selectable text.
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
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="section-kicker">How it works</p>
          <h2>A stronger first version for a file conversion product.</h2>
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

      <section className="section-block note-block">
        <div className="section-heading">
          <p className="section-kicker">Scope note</p>
          <h2>What this version does and where the edges still are.</h2>
        </div>

        <div className="scope-grid">
          <article>
            <h3>Included now</h3>
            <p>
              Browser-side conversion for CSV, JSON, Markdown, HTML, TXT, DOCX, and text-based
              PDF workflows, plus real DOCX and PDF download generation.
            </p>
          </article>
          <article>
            <h3>Current limitation</h3>
            <p>
              PDF extraction is text-based, so scanned or image-only PDFs still need OCR before
              they can convert cleanly.
            </p>
          </article>
          <article>
            <h3>Best next upgrade</h3>
            <p>
              Add a backend pipeline for OCR, image conversion, and heavier office formats that go
              beyond browser-only processing.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
