import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

const KW = new Set(["from", "import", "as", "def", "return", "for", "in", "if", "else", "True", "False", "None", "print", "with", "lambda"]);

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(#.*$)|("[^"]*"|'[^']*')|(\b\d+\.?\d*\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)(?=\s*\()|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [t] = m;
    const cls = m[1] ? "tok-com" : m[2] ? "tok-str" : m[3] ? "tok-num" : KW.has(t) ? "tok-kw" : m[4] ? "tok-fn" : "";
    out.push(cls ? <span key={k++} className={cls}>{t}</span> : t);
    last = m.index + t.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function CodeBlock({ code, filename = "train.py", language = "python" }: { code: string; filename?: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.trim().split("\n");
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-2">
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="flex gap-1.5"><i className="size-2 rounded-full bg-hairline" /><i className="size-2 rounded-full bg-hairline" /><i className="size-2 rounded-full bg-hairline" /></span>
          <span>{filename}</span>
          <span className="text-muted-foreground">{language}</span>
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(code.trim()); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} className="text-lime" /> : <Copy size={13} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6">
        {lines.map((l, i) => (
          <div key={i} className="flex px-4 hover:bg-surface-2/50">
            <span className="mr-5 w-6 shrink-0 select-none text-right text-muted-foreground/50">{i + 1}</span>
            <code>{highlight(l)}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}

export function ConsoleOutput({ lines }: { lines: string[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2 font-mono text-xs">
        <span>output</span><span className="text-orange">placeholder · not executed</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-muted-foreground">
        {lines.map((l, i) => <div key={i}><span className="text-violet">›</span> {l}</div>)}
      </pre>
    </div>
  );
}
