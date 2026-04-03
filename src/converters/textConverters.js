function escapeHtmlBits(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

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

export function turnCsvIntoJson(input) {
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

export function turnJsonIntoCsv(input) {
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

export function turnMarkdownIntoHtml(input) {
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

export function tidyMarkdown(input) {
  return input
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function turnHtmlIntoMarkdown(input) {
  const parser = new DOMParser()
  const document = parser.parseFromString(input, 'text/html')
  const markdown = Array.from(document.body.childNodes)
    .map((node) => blockNodeToMarkdown(node))
    .join('')

  return tidyMarkdown(markdown)
}

export function pullTextFromHtml(input) {
  const parser = new DOMParser()
  const document = parser.parseFromString(input, 'text/html')
  return document.body.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? ''
}

export function turnPlainTextIntoHtml(input) {
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

export function turnPlainTextIntoMarkdown(input) {
  return input
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n\n')
}

export function wrapAsCodeBlockMarkdown(language, input) {
  return `\`\`\`${language}\n${input.trim()}\n\`\`\``
}

export function buildPreformattedPreviewHtml(title, input) {
  return `<article>
  <h1>${escapeHtmlBits(title)}</h1>
  <pre>${escapeHtmlBits(input.trim())}</pre>
</article>`
}
