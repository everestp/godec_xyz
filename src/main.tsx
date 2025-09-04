import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AppWalletProvider from './components/AppWalletProvider.tsx';
import {Provider} from 'react-redux'
// import { store } from './app/store/index.ts';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { DataContextProvider } from './context/DataContext.tsx';
createRoot(document.getElementById("root")!).render(
    <DataContextProvider>
    <AppWalletProvider>


<App />

    </AppWalletProvider>

    </DataContextProvider>

);
