import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AppWalletProvider from './components/AppWalletProvider.tsx';
import {Provider} from 'react-redux'
import { store } from './app/store/index.ts';
createRoot(document.getElementById("root")!).render(
    <AppWalletProvider>
<Provider store={store}>

<App />
</Provider>
    </AppWalletProvider>

);
