import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import '../styles/markdown.css';

/**
 * Renders markdown the same way GitHub Pages does.
 * Used by InfoPage and ChallengesPage.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
