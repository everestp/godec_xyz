require('dotenv').config();

import { Connection, PublicKey } from "@solana/web3.js";
import { Wallet, AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "../idl/godecidl";

const RPC_URL: string = process.env.VITE_RPC_URL!;
const programId:string =process.env.VITE_PROGRAM_ID
export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<any> | null => {
  if (!publicKey || !signTransaction || !sendTransaction) {
    console.error("Wallet not connected or missing signTransaction/sendTransaction");
    return null;
  }

  const connection = new Connection(RPC_URL, "finalized");

  const wallet = {
      publicKey,
      signTransaction,
      sendTransaction,
  } as unknown as Wallet;

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "finalized",
  });

//   const programId = new PublicKey(idl.metadata.address); // Or manually set it if needed
  return new Program(idl as any, provider);
};


export const intilize
