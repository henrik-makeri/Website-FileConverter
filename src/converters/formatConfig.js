import { formatChoices, supportedRoutes } from '../converterData'

export const binaryInputFormats = new Set(['docx', 'pdf', 'jpg', 'png', 'webp', 'mp4', 'mp3'])
export const downloadDocFormats = new Set(['docx', 'pdf'])
export const browserImageFormats = new Set(['jpg', 'png', 'webp'])

export const fileExtensionsByFormat = {
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

export const mimeTypesByFormat = {
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

export function getTargetsForSource(sourceKind) {
  return supportedRoutes.filter((recipe) => recipe.from === sourceKind).map((recipe) => recipe.to)
}

export function getDefaultTargetForSource(sourceKind) {
  return getTargetsForSource(sourceKind)[0] ?? ''
}

export function getFormatLabel(formatValue) {
  return formatChoices.find((option) => option.value === formatValue)?.label ?? formatValue
}

export function getSourceOptions() {
  return formatChoices.filter((option) =>
    supportedRoutes.some((recipe) => recipe.from === option.value),
  )
}

export function guessFormatFromFileName(fileName) {
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

export function getSourceTextareaValue(sourceKind, uploadedName) {
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
