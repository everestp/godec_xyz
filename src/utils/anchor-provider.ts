import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import idl from '../idl/godecidl.json';
import { PublicKey } from '@solana/web3.js';

const getProgram = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
const programId = new PublicKey("GZGMTga8By8XW6vUHq5FUET93PcU9HhhSUa2mimEwSY5");

  if (!publicKey) return null;

  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, signAllTransactions },
    { commitment: 'confirmed' }
  );

  const programID = new web3.PublicKey(programId); // Replace with your deployed program ID
  return new Program(idl as any, programID, provider);
};