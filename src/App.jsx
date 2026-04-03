import './App.css'
import {
  featuredRoutes,
  footerLinkGroups,
  toolDirectoryGroups,
  valueProps,
} from './converterData'
import { useConverter } from './hooks/useConverter'

function App() {
  const {
    activeErrorMessage,
    activeRouteId,
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
    targetKind,
    targetOptions,
    uploadedName,
    getFormatLabel,
    formatChoices,
    supportedRoutes,
  } = useConverter()

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
                  onChange={(event) => handleSourceChange(event.target.value)}
                  aria-label="Source format"
                >
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="hero-inline-label">to</span>
                <select
                  className="hero-select"
                  value={targetKind}
                  onChange={(event) => handleTargetChange(event.target.value)}
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
            <input type="file" onChange={handleFileUpload} />
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
                      onClick={() => handleDirectoryItemSelect(item)}
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
                      onClick={() => handleRouteSelect(recipe)}
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
                  <select value={sourceKind} onChange={(event) => handleSourceChange(event.target.value)}>
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>To</span>
                  <select value={targetKind} onChange={(event) => handleTargetChange(event.target.value)}>
                    {targetOptions.map((format) => (
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
                    onChange={(event) => handleInputChange(event.target.value)}
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
                <button className="secondary-button" type="button" onClick={handleResetInput}>
                  {isBinaryInput
                    ? `Start over with ${getFormatLabel(sourceKind)}`
                    : `Load a ${getFormatLabel(sourceKind)} example`}
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleDownload}
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
