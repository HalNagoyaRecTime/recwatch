import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

/** 本文は加工せず、単独改行はsoft breakとして標準Markdownで解釈する。 */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-text-base min-w-0 break-words whitespace-normal [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_code]:font-mono [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-3 [&_h3]:text-lg [&_h3]:font-bold [&_img]:max-h-90 [&_img]:max-w-full [&_img]:object-contain [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:p-3 [&_pre]:whitespace-pre [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={(url, key) => {
          if (key !== "src") return defaultUrlTransform(url);
          // モバイルと同じく、画像は絶対HTTP(S) URLのみ読み込む。
          try {
            const parsed = new URL(url);
            return ["http:", "https:"].includes(parsed.protocol)
              ? url
              : undefined;
          } catch {
            return undefined;
          }
        }}
        components={{
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            src ? (
              <img src={src} alt={alt ?? "説明画像"} loading="lazy" />
            ) : (
              <span>{alt}</span>
            ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
