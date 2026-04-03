/**
 * ChallengeCard — a clickable tile in the challenges grid.
 * 
 * Shows the challenge date, name, and a short description.
 * When clicked, the parent ChallengesPage expands a DetailPanel.
 */
export default function ChallengeCard({ challenge, isActive, onClick }) {
  const date = new Date(challenge.challengeCreation).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      className={`challenge-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter') && onClick()}
    >
      <div className="challenge-card__label">
        {date}
      </div>
      <h3 className="challenge-card__name">{challenge.challengeName}</h3>
      {challenge.challengeDescription && (
        <p className="challenge-card__desc">{challenge.challengeDescription}</p>
      )}
    </div>
  );
}
