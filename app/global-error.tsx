"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            We encountered a critical error.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              background: '#0A84FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
