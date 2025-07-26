'use client';

export default function MinimalPage() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(45deg, #667eea, #764ba2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🎬 Minimal React Page</h1>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
        <button 
          onClick={() => alert('React button works!')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid white',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test React Button
        </button>
      </div>
    </div>
  );
}