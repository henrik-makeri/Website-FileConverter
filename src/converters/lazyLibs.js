let cachedMammothPromise
let cachedPdfJsPromise
let cachedDocxPromise
let cachedJsPdfPromise
let cachedLamePromise

export async function getMammothLib() {
  if (!cachedMammothPromise) {
    cachedMammothPromise = import('mammoth').then((module) => module.default ?? module)
  }

  return cachedMammothPromise
}

export async function getPdfJsLib() {
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

export async function getDocxLib() {
  if (!cachedDocxPromise) {
    cachedDocxPromise = import('docx')
  }

  return cachedDocxPromise
}

export async function getJsPdfLib() {
  if (!cachedJsPdfPromise) {
    cachedJsPdfPromise = import('jspdf').then((module) => module.jsPDF)
  }

  return cachedJsPdfPromise
}

export async function getLameLib() {
  if (!cachedLamePromise) {
    cachedLamePromise = import('lamejs').then((module) => module.default ?? module)
  }

  return cachedLamePromise
}
