import { message } from 'antd';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const collectPageStyles = () => {
  const chunks = [];

  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      if (!sheet.cssRules) return;
      Array.from(sheet.cssRules).forEach((rule) => {
        chunks.push(rule.cssText);
      });
    } catch (error) {
      if (sheet.href) {
        chunks.push(`@import url("${sheet.href}");`);
      }
    }
  });

  document.querySelectorAll('style').forEach((style) => {
    if (style.textContent) chunks.push(style.textContent);
  });

  return chunks.join('\n');
};

export const printExactElement = ({ element, title = 'BIIT Document', pageStyles = '', windowSize = 'width=1200,height=900' }) => {
  if (!element) {
    message.error('Nothing selected to print.');
    return;
  }

  const printWindow = window.open('', '_blank', windowSize);

  if (!printWindow) {
    message.error('Popup blocked. Please allow popups and try again.');
    return;
  }

  const styles = collectPageStyles();
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      ${styles}
      ${pageStyles}
    </style>
  </head>
  <body class="biit-print-body">
    <main class="biit-print-stage">
      ${element.outerHTML}
    </main>
    <script>
      const runPrint = function () {
        window.focus();
        setTimeout(function () { window.print(); }, 350);
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(runPrint).catch(runPrint);
      } else {
        window.onload = runPrint;
      }
    </script>
  </body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
