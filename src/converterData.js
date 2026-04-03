export const formatChoices = [
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

export const supportedRoutes = [
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

export const featuredRoutes = [
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

export const demoInputs = {
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

export const valueProps = [
  {
    title: 'Private for current workflows',
    body: 'Most of the current document flow stays in the browser.',
  },
  {
    title: 'Quality-first output',
    body: 'You can preview the result before downloading it.',
  },
]

export const toolDirectoryGroups = [
  {
    title: 'Video & Audio',
    description:
      'A few media entry points now lead into the MP4 to MP3 workflow, while the broader audio and video tools are still planned.',
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
    description:
      'The image stuff here is the practical browser-friendly set: JPG, PNG, WEBP, and PDF packaging.',
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

export const footerLinkGroups = [
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
