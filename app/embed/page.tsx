import ReactVideoEditor from '@/components/editor/version-7.0.0/react-video-editor';

export default function EmbedPage() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0,
      overflow: 'hidden'
    }}>
      <ReactVideoEditor projectId="embed-project" />
    </div>
  );
}