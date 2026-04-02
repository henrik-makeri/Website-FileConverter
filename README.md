# Website-FileConverter

Browser-first file conversion app built with React and Vite. It supports document, image, text, and media conversion with live preview and downloadable output from one workspace.

Live demo:
[https://henrik-makeri.github.io/Website-FileConverter/](https://henrik-makeri.github.io/Website-FileConverter/)

![Website-FileConverter preview](./docs/website-preview.png)

Overview:
Website-FileConverter is a portfolio project focused on practical in-browser conversion workflows. It gives users a real conversion workspace where they can upload files and preview the result in the browser.

Why I built this:
I wanted to make something real for my first project and have a finished website I could actually show people.

Key features:
- Convert CSV, JSON, Markdown, HTML, and plain text between multiple formats
- Parse DOCX uploads in the browser and export to TXT, HTML, Markdown, PDF, and DOCX workflows
- Extract text from text-based PDFs and convert to TXT, HTML, Markdown, or DOCX
- Convert browser-friendly images between JPG, PNG, WEBP, and PDF
- Extract MP3 audio from uploaded MP4 files in the browser
- Preview conversions before download and handle download and export client-side

Tech stack:
- React 19
- Vite
- `pdfjs-dist` for PDF parsing
- `mammoth` for DOCX extraction
- `docx` and `jspdf` for document export
- `lamejs` for MP3 encoding
