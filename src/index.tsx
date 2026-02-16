import ReactDom from 'react-dom/client';
import App from './App';
import '../styles.css';

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
