/**
 * High-Fidelity A4 Vector Print & PDF Generator
 * Creates an isolated, clean print frame containing exclusively the styled resume document.
 * Bypasses application sidebars, navigation, modals, and zoom transformations.
 */
export function printResumeDocument({ elementId, htmlContent, title = 'Emaan-Humayun-Resume' }) {
  let resumeNode = null;

  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      resumeNode = el.cloneNode(true);
    }
  }

  // Create temporary hidden printing iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();

  // Collect all stylesheets and style blocks currently loaded in the app
  const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML)
    .join('\n');

  // Clean the cloned node of any interactive/canvas artifacts
  let resumeHtml = htmlContent;
  if (resumeNode) {
    resumeNode.style.transform = 'none';
    resumeNode.style.boxShadow = 'none';
    resumeNode.style.margin = '0 auto';
    resumeNode.classList.remove('shadow-xl', 'shadow-2xl', 'shadow-lg');
    resumeHtml = resumeNode.outerHTML;
  }

  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
        ${styleTags}
        <style>
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 210mm !important;
            -webkit-font-smoothing: antialiased;
          }
          .resume-canvas-outer {
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
          }
          .resume-paper {
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            page-break-after: auto;
          }
          .break-inside-avoid,
          .resume-entry,
          .resume-section-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          a {
            text-decoration: none !important;
            color: inherit !important;
          }
        </style>
      </head>
      <body>
        ${resumeHtml || '<div style="padding: 20mm; font-family: sans-serif;">Rendering resume...</div>'}
      </body>
    </html>
  `);
  doc.close();

  // Allow web fonts, images, and Tailwind styles to settle
  setTimeout(() => {
    try {
      const prevTitle = document.title;
      document.title = title;
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.title = prevTitle;
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    } catch (err) {
      console.error('[PRINT] Failed to invoke isolated print:', err);
      // Fallback
      window.print();
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  }, 400);
}

