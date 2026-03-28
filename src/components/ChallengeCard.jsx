/**
 * Challenge card tile for the grid.
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
        Challenge #{challenge.challengeId.split('-').pop()}
      </div>
      <h3 className="challenge-card__name">{challenge.challengeName}</h3>
      <div className="challenge-card__date">📅 {date}</div>
      {challenge.challengeDescription && (
        <p className="challenge-card__desc">{challenge.challengeDescription}</p>
      )}
    </div>
  );
}
