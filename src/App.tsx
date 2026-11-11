import {Button} from '@astryxdesign/core/Button';

export default function App() {
  return (
    <main className="page">
      <div className="intro">
        <p className="eyebrow">OPUS CLIENT</p>
        <h1>Opus Client Web</h1>
        <p>React 19, TypeScript, Vite, and the Astryx design system are ready.</p>
        <Button label="Astryx Documentation" variant="primary" onClick={() => window.open('https://astryx.atmeta.com', '_blank', 'noopener,noreferrer')} />
      </div>
    </main>
  );
}
