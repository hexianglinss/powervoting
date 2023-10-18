import React,{ useState, useEffect, useRef } from "react";
import {useRoutes, useLocation, Link} from "react-router-dom";
import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { walletChainList, walletConnectProjectId } from './common/consts';
import routes from "./router";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [...walletChainList],
  [
    publicProvider(),
  ]
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: walletConnectProjectId, chains }),
      // rainbowWallet({ projectId: walletConnectProjectId, chains }),
      // trustWallet({ projectId: walletConnectProjectId, chains }),
      // coinbaseWallet({ appName: 'power-voting', chains }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
})
import ConnectWeb3Button from "./components/ConnectWeb3Button";
import Footer from './components/Footer';

import "./common/styles/reset.less";
import "tailwindcss/tailwind.css";
import "./common/styles/app.less";

const App: React.FC = () => {
  const location = useLocation();
  const element = useRoutes(routes);
  const [showButton, setShowButton] = useState(false);

  const scrollToTop = () => {
    const element = scrollRef.current;
    // @ts-ignore
    element.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = scrollRef.current;
      // @ts-ignore
      setShowButton(element.scrollTop > 300)
    };

    // @ts-ignore
    scrollRef.current.addEventListener('scroll', handleScroll);

    return () => {
      // @ts-ignore
      scrollRef.current.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [location])

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#7b3fe4",
          accentColorForeground: "white",
        })}
        chains={chains}
        modalSize="compact"
      >
        <div className="layout font-body" id='scrollBox' ref={scrollRef}>
          <header className='h-[96px]  bg-[#273141]'>
            <div className='w-[1000px] h-[96px] mx-auto flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <Link to='/'>
                    <img className="logo" src="/images/logo1.png" alt=""/>
                  </Link>
                </div>
                <div className='ml-6 flex items-baseline space-x-20'>
                  <Link
                    to='/'
                    className='text-white text-2xl font-semibold hover:opacity-80'
                  >
                    Power Voting
                  </Link>
                </div>
              </div>
              <div className='flex items-center'>
                <ConnectWeb3Button/>
              </div>
            </div>
          </header>
          <div className='content w-[1000px] mx-auto pt-10 pb-10'>
            {element}
          </div>
          <Footer/>
          <button onClick={scrollToTop} className={`${showButton ? '' : 'hidden'} fixed bottom-[6rem] right-[6rem] z-40  p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none`}>
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 3l-8 8h5v10h6V11h5z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App
