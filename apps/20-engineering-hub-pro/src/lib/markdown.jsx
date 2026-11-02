import React from 'react';

/**
 * Safe, zero-dependency Markdown parser that converts Markdown strings into sanitized React elements.
 * Supports headings, bold, italic, strikethrough, inline code, code blocks with language labels,
 * blockquotes, links, images, ordered/unordered lists, task checklists, tables, and horizontal rules.
 * Prevents XSS vulnerabilities by constructing native React elements without dangerouslySetInnerHTML.
 */
export function SafeMarkdown({ content = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = '';
  let listBuffer = [];
  let tableBuffer = [];

  function flushList() {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-3 ml-2 space-y-1.5 text-text">
          {listBuffer.map((item, idx) => {
            if (item.type === 'task') {
              return (
                <li key={idx} className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    readOnly
                    checked={item.checked}
                    className="mt-0.5 rounded border-border text-primary focus:ring-0 cursor-default"
                  />
                  <span className={item.checked ? 'line-through opacity-70' : ''}>
                    {parseInline(item.text)}
                  </span>
                </li>
              );
            }
            return (
              <li key={idx} className="list-disc ml-5 text-xs leading-relaxed">
                {parseInline(item.text)}
              </li>
            );
          })}
        </ul>
      );
      listBuffer = [];
    }
  }

  function flushTable() {
    if (tableBuffer.length >= 2) {
      // First row is header, second is delimiter (|---|---|), rest are rows
      const headerRow = parseTableRow(tableBuffer[0]);
      const dataRows = tableBuffer.slice(2).map(r => parseTableRow(r));

      elements.push(
        <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-xl border border-border shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-background/80 border-b border-border">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="px-3.5 py-2.5 font-bold font-mono text-text uppercase tracking-wider">
                    {parseInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface/50 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-text">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    } else if (tableBuffer.length > 0) {
      // If table wasn't properly formed, flush as text
      tableBuffer.forEach((line, idx) => {
        elements.push(<p key={`tbl-txt-${elements.length}-${idx}`} className="my-1 text-xs">{parseInline(line)}</p>);
      });
      tableBuffer = [];
    }
  }

  function parseTableRow(line) {
    let clean = line.trim();
    if (clean.startsWith('|')) clean = clean.slice(1);
    if (clean.endsWith('|')) clean = clean.slice(0, -1);
    return clean.split('|').map(s => s.trim());
  }

  function parseInline(text) {
    if (!text) return null;
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining) {
      // Image ![alt](url)
      const imgMatch = remaining.match(/^(.*?)!\[(.*?)\]\((.*?)\)/);
      // Link [text](url)
      const linkMatch = remaining.match(/^(.*?)\[(.*?)\]\((.*?)\)/);
      // Bold **text**
      const boldMatch = remaining.match(/^(.*?)(\*\*|__)(.*?)\2/);
      // Strikethrough ~~text~~
      const strikeMatch = remaining.match(/^(.*?)(~~)(.*?)\2/);
      // Inline code `text`
      const codeMatch = remaining.match(/^(.*?)(`)(.*?)\2/);
      // Italic *text*
      const italicMatch = remaining.match(/^(.*?)(\*|_)(.*?)\2/);

      const matches = [
        imgMatch ? { type: 'image', index: imgMatch[1].length, match: imgMatch } : null,
        linkMatch ? { type: 'link', index: linkMatch[1].length, match: linkMatch } : null,
        boldMatch ? { type: 'bold', index: boldMatch[1].length, match: boldMatch } : null,
        strikeMatch ? { type: 'strike', index: strikeMatch[1].length, match: strikeMatch } : null,
        codeMatch ? { type: 'code', index: codeMatch[1].length, match: codeMatch } : null,
        italicMatch ? { type: 'italic', index: italicMatch[1].length, match: italicMatch } : null
      ].filter(Boolean).sort((a, b) => a.index - b.index);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const earliest = matches[0];
      const prefix = earliest.match[1];
      if (prefix) parts.push(prefix);

      if (earliest.type === 'image') {
        const alt = earliest.match[2];
        const src = earliest.match[3];
        parts.push(
          <img
            key={keyIdx++}
            src={src}
            alt={alt}
            className="my-3 max-h-96 rounded-xl border border-border object-contain"
          />
        );
        remaining = remaining.slice(earliest.match[0].length);
      } else if (earliest.type === 'link') {
        const url = earliest.match[3];
        const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('#') ? url : '#';
        parts.push(
          <a
            key={keyIdx++}
            href={safeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline hover:opacity-80 font-medium"
          >
            {earliest.match[2]}
          </a>
        );
        remaining = remaining.slice(earliest.match[0].length);
      } else if (earliest.type === 'bold') {
        parts.push(<strong key={keyIdx++} className="font-bold text-text">{earliest.match[3]}</strong>);
        remaining = remaining.slice(earliest.match[0].length);
      } else if (earliest.type === 'strike') {
        parts.push(<span key={keyIdx++} className="line-through text-muted">{earliest.match[3]}</span>);
        remaining = remaining.slice(earliest.match[0].length);
      } else if (earliest.type === 'code') {
        parts.push(
          <code key={keyIdx++} className="rounded bg-background px-1.5 py-0.5 font-mono text-xs text-primary border border-border">
            {earliest.match[3]}
          </code>
        );
        remaining = remaining.slice(earliest.match[0].length);
      } else if (earliest.type === 'italic') {
        parts.push(<em key={keyIdx++} className="italic text-text">{earliest.match[3]}</em>);
        remaining = remaining.slice(earliest.match[0].length);
      }
    }

    return parts;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-block-${i}`} className="my-4 overflow-hidden rounded-xl border border-border shadow-2xs">
            {codeLanguage && (
              <div className="bg-surface px-4 py-1.5 border-b border-border flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                <span>{codeLanguage}</span>
                <span>snippet</span>
              </div>
            )}
            <pre className="overflow-x-auto bg-stone-900 p-4 font-mono text-xs text-stone-100 leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        codeLanguage = line.trim().replace(/^```/, '').trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Tables (| cell | cell |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      tableBuffer.push(line);
      continue;
    } else {
      flushTable();
    }

    // Task Checklist items (- [ ] or - [x])
    const taskMatch = line.match(/^[\*\-]\s+\[([ xX])\]\s+(.*)/);
    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === 'x';
      listBuffer.push({ type: 'task', checked, text: taskMatch[2] });
      continue;
    }

    // Standard list items
    const listMatch = line.match(/^[\*\-]\s+(.*)/);
    if (listMatch) {
      listBuffer.push({ type: 'bullet', text: listMatch[1] });
      continue;
    } else {
      flushList();
    }

    // Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-border" />);
      continue;
    }

    // Headers
    if (line.startsWith('###### ')) {
      elements.push(<h6 key={`h6-${i}`} className="mt-4 mb-2 text-xs font-bold uppercase tracking-wider text-muted">{parseInline(line.slice(7))}</h6>);
    } else if (line.startsWith('##### ')) {
      elements.push(<h5 key={`h5-${i}`} className="mt-4 mb-2 text-xs font-bold text-text">{parseInline(line.slice(6))}</h5>);
    } else if (line.startsWith('#### ')) {
      elements.push(<h4 key={`h4-${i}`} className="mt-5 mb-2 text-sm font-bold text-text">{parseInline(line.slice(5))}</h4>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="mt-6 mb-2 text-base font-bold text-text">{parseInline(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} className="mt-7 mb-3 text-lg font-bold font-display text-text">{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={`h1-${i}`} className="mt-8 mb-4 text-xl font-black font-display text-text">{parseInline(line.slice(2))}</h1>);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-3 border-l-3 border-primary/50 bg-background/50 py-1.5 pl-3.5 pr-2 rounded-r-lg italic text-xs text-muted">
          {parseInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === '') {
      continue;
    } else {
      elements.push(<p key={`p-${i}`} className="my-2 text-xs leading-relaxed text-text">{parseInline(line)}</p>);
    }
  }

  flushList();
  flushTable();
  return <div className="prose-safe space-y-1">{elements}</div>;
}
