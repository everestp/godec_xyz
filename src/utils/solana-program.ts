

import { AnchorProvider, Program, utils, web3, BN } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import idl from '../idl/godecidl.json';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';

const programID = new web3.PublicKey('GZGMTga8By8XW6vUHq5FUET93PcU9HhhSUa2mimEwSY5');

const RPC_URL ="https://api.devnet.solana.com"
// A custom hook to get the program instance
export const useProgram = () => {
  const wallet = useWallet();
  const connection = new Connection(RPC_URL);

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    // Set the commitment level to 'finalized'
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'finalized' } // This is the key change
    );

    return new Program(idl as any, programID, provider);
  }, [wallet, connection]);

  return program;
};







// Returns the PDA for a note.
export const getNoteAddress = (author: web3.PublicKey, title: string): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('note'), author.toBuffer(), utils.bytes.utf8.encode(title)],
    programID
  );
  return pda;
};

// Returns the PDA for a specific task.
export const getTaskAddress = (author: web3.PublicKey, taskTitle: string): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('todo'), author.toBuffer(), utils.bytes.utf8.encode(taskTitle)],
    programID
  );
  return pda;
};

// Returns the PDA for the global program state.
export const getProgramStateAddress = (): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('program_state')],
    programID
  );
  return pda;
};

// Returns the PDA for a specific campaign.
export const getCampaignAddress = (campaignId: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('campaign'), new BN(campaignId).toBuffer('le', 8)],
    programID
  );
  return pda;
};

// Returns the PDA for a donor's transaction.
export const getDonorTransactionAddress = (donor: web3.PublicKey, cid: number, donorCount: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode('donor'),
      donor.toBuffer(),
      new BN(cid).toBuffer('le', 8),
      new BN(donorCount).toBuffer('le', 8),
    ],
    programID
  );
  return pda;
};

// Returns the PDA for a withdrawal transaction.
export const getWithdrawTransactionAddress = (creator: web3.PublicKey, cid: number, withdrawalCount: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode('withdraw'),
      creator.toBuffer(),
      new BN(cid).toBuffer('le', 8),
      new BN(withdrawalCount).toBuffer('le', 8),
    ],
    programID
  );
  return pda;
};

// Returns the PDA for a specific poll.
export const getPollAddress = (pollId: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [new BN(pollId).toBuffer('le', 8)],
    programID
  );
  return pda;
};

// Returns the PDA for a global counter.
export const getCounterAddress = (): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('counter')],
    programID
  );
  return pda;
};

// Returns the PDA for the registrations account.
export const getRegistrationAddress = (): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('registerations')],
    programID
  );
  return pda;
};

// Returns the PDA for a specific candidate.
export const getCandidateAddress = (pollId: number, candidateId: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [new BN(pollId).toBuffer('le', 8), new BN(candidateId).toBuffer('le', 8)],
    programID
  );
  return pda;
};

// Returns the PDA for a voter in a specific poll.
export const getVoterAddress = (pollId: number, user: web3.PublicKey): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('voter'), new BN(pollId).toBuffer('le', 8), user.toBuffer()],
    programID
  );
  return pda;
};

// Returns the PDA for a user's profile.
export const getUserAddress = (authority: web3.PublicKey): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('user'), authority.toBuffer()],
    programID
  );
  return pda;
};

// Returns the PDA for a specific post.
export const getPostAddress = (authority: web3.PublicKey, postId: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('post'), authority.toBuffer(), new BN(postId).toBuffer('le', 1)],
    programID
  );
  return pda;
};

// Returns the PDA for a message thread.
export const getThreadAddress = (sender: web3.PublicKey, recipient: web3.PublicKey): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('thread'), sender.toBuffer(), recipient.toBuffer()],
    programID
  );
  return pda;
};

// Returns the PDA for a specific message within a thread.
export const getMessageAddress = (thread: web3.PublicKey, sender: web3.PublicKey, timestamp: number): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode('message'),
      thread.toBuffer(),
      sender.toBuffer(),
      new BN(timestamp).toBuffer('le', 1),
    ],
    programID
  );
  return pda;
};