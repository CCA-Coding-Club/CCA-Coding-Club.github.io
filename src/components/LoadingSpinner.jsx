/**
 * Simple loading / empty / error status messages.
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
