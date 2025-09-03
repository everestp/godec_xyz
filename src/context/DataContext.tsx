
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {BN} from '@project-serum/anchor'
import { SystemProgram ,LAMPORTS_PER_SOL } from "@solana/web3.js";
import {useAnchorWallet ,useConnection} from '@solana/wallet-adapter-react'
import bs58 from "bs58"
import { connected } from "process";
// import { getProgram } from "@/program/votingProgram";
// Create Context
export const DataContext = createContext(null);

// Create Provider Component
export const DataContextProvider = ({ children }) => {
 
  const {connection}= useConnection()
  const wallet = useAnchorWallet()
  const program = useMemo(()=>{
if(connection){
  return getProgram(connection ,wallet ?? mockWallet())
}
  },[connection ,wallet])
  







  const contextValue = {
  connected:wallet?.publicKey ?true :false
   
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom Hook
export const useData = () => useContext(DataContext);