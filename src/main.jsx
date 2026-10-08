import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 오프라인에서도 열리도록 서비스 워커 등록 (배포 빌드에서만, 개발 중 캐시 혼란 방지)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 등록 실패해도 앱은 그대로 동작
    });
  });
}
