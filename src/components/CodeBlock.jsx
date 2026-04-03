/**
 * CodeBlock — reusable syntax-highlighted code viewer.
 * 
 * Automatically detects the programming language using Flourite.
 * Shows a language badge in the top-right corner.
 * 
 * Usage: <CodeBlock code="print('hello')" />
 * 
 * Used by MemberSubmissionGroup on the Challenges page.
 * Can be reused anywhere code needs to be displayed.
 */
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import flourite from 'flourite';

// Register languages that club members commonly use
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c++', cpp);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('c#', csharp);

/**
 * Guess the programming language of a code string.
 * Falls back to 'text' if unknown (prevents highlighter crashes).
 */
function guessLang(code) {
  try {
    const result = flourite(code, { noUnknown: true }).language;
    if (result === 'Unknown') return 'text';
    return result.toLowerCase();
  } catch {
    return 'text';
  }
}

export default function CodeBlock({ code }) {
  const language = guessLang(code);

  return (
    <div className="code-block">
      <div className="code-block__lang">{language}</div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem' }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
