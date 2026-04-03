import {
  browserImageFormats,
  getFormatLabel,
  mimeTypesByFormat,
} from './formatConfig'
import { getLameLib, getPdfJsLib } from './lazyLibs'

export function formatByteSize(byteLength) {
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

export async function loadBrowserImageFromBytes(uploadedBytes, format) {
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

export async function readImageMetadata(uploadedBytes, format) {
  const image = await loadBrowserImageFromBytes(uploadedBytes, format)

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  }
}

export async function convertImageToBlob(uploadedBytes, sourceKind, targetKind) {
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

export async function readVideoMetadata(uploadedBytes) {
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

export function formatPlaybackTime(seconds) {
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

export async function convertMp4IntoMp3Blob(uploadedBytes) {
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

export async function pullTextOutOfPdf(uploadedBytes) {
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
      chunks.push(item.hasEOL ? '\n' : ' ')
    })

    const pageText = chunks.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

    if (pageText) {
      pages.push(pageText)
    }
  }

  return pages.join('\n\n')
}

export function buildBinarySnapshotText(sourceKind, uploadedBytes, metadata = {}) {
  if (browserImageFormats.has(sourceKind)) {
    return `${getFormatLabel(sourceKind)} image loaded\n${metadata.width} x ${metadata.height}px\n${formatByteSize(uploadedBytes.byteLength)}`
  }

  if (sourceKind === 'mp4') {
    return `MP4 video loaded\nDuration ${formatPlaybackTime(metadata.duration)}\n${metadata.width} x ${metadata.height}px\n${formatByteSize(uploadedBytes.byteLength)}`
  }

  return ''
}
