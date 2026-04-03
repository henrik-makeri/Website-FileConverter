import { getDocxLib, getJsPdfLib, getMammothLib } from './lazyLibs'
import {
  buildPreformattedPreviewHtml,
  pullTextFromHtml,
  tidyMarkdown,
  turnCsvIntoJson,
  turnHtmlIntoMarkdown,
  turnJsonIntoCsv,
  turnMarkdownIntoHtml,
  turnPlainTextIntoHtml,
  turnPlainTextIntoMarkdown,
  wrapAsCodeBlockMarkdown,
} from './textConverters'
import {
  browserImageFormats,
  fileExtensionsByFormat,
  getFormatLabel,
  mimeTypesByFormat,
} from './formatConfig'
import {
  buildBinarySnapshotText,
  convertImageToBlob,
  convertMp4IntoMp3Blob,
  loadBrowserImageFromBytes,
  pullTextOutOfPdf,
  readImageMetadata,
  readVideoMetadata,
} from './fileConverters'

export async function buildSourceContentSnapshot(sourceKind, inputValue, uploadedBytes) {
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
      text: buildBinarySnapshotText(sourceKind, uploadedBytes, metadata),
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
      text: buildBinarySnapshotText(sourceKind, uploadedBytes, metadata),
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

export function buildTextPreviewForTarget(sourceKind, targetKind, inputValue, contentSnapshot) {
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

export async function buildDocxDownloadBlob(contentSnapshot) {
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

export async function buildPdfDownloadBlob(contentSnapshot) {
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
    const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' })
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

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
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

export async function downloadForTarget({
  contentSnapshot,
  previewValue,
  sourceKind,
  targetKind,
  uploadedName,
}) {
  const baseName = uploadedName ? uploadedName.replace(/\.[^.]+$/, '') : `${sourceKind}-converted`

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
}
