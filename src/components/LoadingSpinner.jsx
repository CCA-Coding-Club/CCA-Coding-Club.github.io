/**
 * LoadingSpinner — simple status message components.
 * 
 * Loading: shows a loading message (e.g. "Loading challenges...")
 * Empty:   shows a title + description when there's no data
 * Error:   shows an error message when something goes wrong
 * 
 * Used throughout the app for consistent loading/empty/error states.
 */

export function Loading({ text = 'Loading...' }) {
  return <div className="status-message"><p>{text}</p></div>;
}

export function Empty({ title, description }) {
  return (
    <div className="status-message">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function Error({ message }) {
  return (
    <div className="status-message">
      <h3>Something went wrong</h3>
      <p>{message}</p>
    </div>
  );
}
