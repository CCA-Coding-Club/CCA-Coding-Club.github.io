/**
 * DetailPanel — expanded view of a selected challenge.
 * 
 * Shows the challenge title, date, markdown details, and a button
 * to toggle the solutions panel. Appears above the card grid on
 * the Challenges page when a card is clicked.
 */
import MarkdownRenderer from './MarkdownRenderer';
import SolutionsPanel from './SolutionsPanel';

export default function DetailPanel({ challenge, onClose, showSolutions, onToggleSolutions }) {
  const date = new Date(challenge.challengeCreation).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="challenge-detail">
      <div className="challenge-detail__top">
        <div>
          <h2 className="challenge-detail__title">{challenge.challengeName}</h2>
          <p className="challenge-detail__date">{date}</p>
        </div>
        <button className="challenge-detail__close" onClick={onClose}>✕</button>
      </div>

      <div className="challenge-detail__body">
        <MarkdownRenderer content={challenge.challengeDetails} />
      </div>

      <div className="actions-bar">
        <button
          className={`btn ${showSolutions ? 'btn--primary' : ''}`}
          onClick={onToggleSolutions}
        >
          {showSolutions ? 'Hide Solutions' : 'View Solutions'}
        </button>
      </div>

      {showSolutions && <SolutionsPanel challengeId={challenge.challengeId} />}
    </div>
  );
}
