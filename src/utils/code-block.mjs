// Shiki transformer that wraps each highlighted block in a frame with a header
// showing the language and a copy button. Done at build time so the header is
// in the static HTML and nothing shifts when the page loads; the copy button
// stays hidden until the client script in the post layout enables it.

const LABELS = {
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  console: 'Console',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  md: 'Markdown',
  markdown: 'Markdown',
  astro: 'Astro',
  py: 'Python',
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  rs: 'Rust',
  rust: 'Rust',
  go: 'Go',
  asm: 'Assembly',
  nasm: 'Assembly',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  sql: 'SQL',
  diff: 'Diff',
  plaintext: 'Text',
  text: 'Text',
  txt: 'Text',
};

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

export function codeBlockFrame() {
  return {
    name: 'code-block-frame',
    root(root) {
      const pre = root.children.find((node) => node.type === 'element' && node.tagName === 'pre');
      if (!pre) return;
      const lang = this.options.lang ?? 'text';
      const label = LABELS[lang.toLowerCase()] ?? lang;

      const header = el('div', { className: ['code-block__header'] }, [
        el('span', { className: ['code-block__lang'] }, [text(label)]),
        el('button', { type: 'button', className: ['code-block__copy'], hidden: true }, [
          el('span', { className: ['code-block__copy-label'] }, [text('Copy')]),
        ]),
      ]);

      root.children = [el('figure', { className: ['code-block'], dataLanguage: lang }, [header, pre])];
    },
  };
}
