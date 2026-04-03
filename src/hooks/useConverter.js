import { startTransition, useEffect, useState } from 'react'
import { demoInputs, formatChoices, supportedRoutes } from '../converterData'
import {
  buildSourceContentSnapshot,
  buildTextPreviewForTarget,
  downloadForTarget,
} from '../converters/conversionEngine'
import {
  binaryInputFormats,
  downloadDocFormats,
  getDefaultTargetForSource,
  getFormatLabel,
  getSourceOptions,
  getSourceTextareaValue,
  getTargetsForSource,
  guessFormatFromFileName,
} from '../converters/formatConfig'

// this hook has the app state and event handlers
export function useConverter() {
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

  const sourceOptions = getSourceOptions()
  const targetOptions = getTargetsForSource(sourceKind)
  const activeRouteId = `${sourceKind}-${targetKind}`
  const isBinaryInput = binaryInputFormats.has(sourceKind)
  const isDocumentDownload = downloadDocFormats.has(targetKind)
  const shownInputValue = isBinaryInput
    ? getSourceTextareaValue(sourceKind, uploadedName)
    : inputValue
  const activeErrorMessage = fileLoadError || conversionIssue
  const previewDelayMs = uploadedBytes && isBinaryInput ? 300 : 0

  // This reebuilds the preview whenever the source, target, or upload changes
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

        const nextPreview = buildTextPreviewForTarget(
          sourceKind,
          targetKind,
          inputValue,
          nextRichContent,
        )

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
  }, [inputValue, isBinaryInput, previewDelayMs, sourceKind, targetKind, uploadedBytes])

  function clearErrors() {
    setUploadError('')
    setConversionError('')
  }

  // source switches for reset logic
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

  function handleSourceChange(nextSource) {
    const nextTargets = getTargetsForSource(nextSource)
    const nextTarget = nextTargets.includes(targetKind) ? targetKind : nextTargets[0]
    applySourceChange(nextSource, nextTarget, {
      inputValue: binaryInputFormats.has(nextSource) ? '' : demoInputs[nextSource] ?? '',
    })
  }

  function handleTargetChange(nextTarget) {
    clearErrors()
    setTargetFormat(nextTarget)
  }

  function handleRouteSelect(recipe) {
    applySourceChange(recipe.from, recipe.to, {
      inputValue: binaryInputFormats.has(recipe.from) ? '' : demoInputs[recipe.from] ?? '',
    })
  }

  function handleDirectoryItemSelect(item) {
    if (item.status !== 'live') {
      return
    }

    handleRouteSelect(item)
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleInputChange(nextValue) {
    if (isBinaryInput) {
      return
    }

    clearErrors()
    setUploadedFileName('')
    setSourceBytes(null)
    setInputText(nextValue)
  }

  function handleResetInput() {
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

  async function handleDownload() {
    if (!contentSnapshot || !previewValue) {
      return
    }

    setIsDownloading(true)

    try {
      await downloadForTarget({
        contentSnapshot,
        previewValue,
        sourceKind,
        targetKind,
        uploadedName,
      })
    } catch (error) {
      setConversionError(error.message || 'Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const inferredFormat = guessFormatFromFileName(file.name)
    const nextSource = inferredFormat || sourceKind
    const nextTargets = getTargetsForSource(nextSource)
    const nextTarget = nextTargets.includes(targetKind)
      ? targetKind
      : getDefaultTargetForSource(nextSource)
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

  return {
    activeErrorMessage,
    activeRouteId,
    formatChoices,
    getFormatLabel,
    handleDirectoryItemSelect,
    handleDownload,
    handleFileUpload,
    handleInputChange,
    handleResetInput,
    handleRouteSelect,
    handleSourceChange,
    handleTargetChange,
    isBinaryInput,
    isConverting,
    isDocumentDownload,
    isPreparingDownload,
    previewValue,
    shownInputValue,
    sourceKind,
    sourceOptions,
    supportedRoutes,
    targetKind,
    targetOptions,
    uploadedName,
  }
}
