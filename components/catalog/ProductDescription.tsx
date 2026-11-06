import type { ReactNode } from "react";

type DescriptionBlock =
  | { type: "paragraph" | "heading"; lines: string[] }
  | { type: "list"; lines: string[] };

function isHeading(line: string) {
  return /^#{1,3}\s/.test(line) || /^(\*\*|__).*\1$/.test(line) || /^[A-Z][A-Za-z &/()-]{1,48}:$/.test(line);
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-[#333]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ProductDescription({ description }: { description: string }) {
  const lines = description.replace(/\r\n?/g, "\n").split("\n");
  const blocks: DescriptionBlock[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", lines: items });
      continue;
    }

    if (isHeading(line)) {
      blocks.push({ type: "heading", lines: [line.replace(/^#{1,3}\s+/, "").replace(/^(\*\*|__)(.*)\1$/, "$2").replace(/:$/, "")] });
      index += 1;
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^\s*[-*]\s+/.test(lines[index]) && !isHeading(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", lines: paragraph });
  }

  return <div className="product-description-copy mt-3 space-y-5 text-sm leading-7 text-[#666] sm:mt-4 sm:text-[15px] sm:leading-8">
    {blocks.map((block, index) => block.type === "heading"
      ? <h3 key={index} className="pt-1 text-sm font-semibold leading-6 text-[#222] sm:text-base">{renderInline(block.lines[0])}</h3>
      : block.type === "list"
        ? <ul key={index} className="list-disc space-y-1.5 pl-5 marker:text-[#999]">{block.lines.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ul>
        : <p key={index}>{block.lines.map((paragraphLine, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && " "}{renderInline(paragraphLine)}</span>)}</p>)}
  </div>;
}
