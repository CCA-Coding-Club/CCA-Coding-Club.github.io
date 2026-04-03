import { useState, useEffect } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import infoUrl from '../content/info.md';
import '../styles/info.css';

export default function InfoPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(infoUrl)
      .then(res => res.text())
      .then(setContent)
      .catch(() => setContent('# Error\nFailed to load content.'));
  }, []);

  return (
    <main className="info-page">
      <MarkdownRenderer content={content} />
    </main>
  );
}
