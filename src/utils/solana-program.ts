

import { AnchorProvider, Program, utils, web3 } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import idl from '../idl/godecidl.json';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMemo } from 'react';
import { Buffer } from 'buffer';
import { BN } from '@coral-xyz/anchor';

const programID = new web3.PublicKey('73KCAwnfEwU7LPX7Ri2FXHvp1NZtCyRUc6EJVvm59oEs');

 
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










export function getThreadAddress(sender: PublicKey, recipient: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("thread"),
      sender.toBuffer(),
      recipient.toBuffer(),
    ],
   programID
  )[0];
}

// Returns the PDA for a specific message within a thread.
export function getMessageAddress(
  thread: PublicKey,
  sender: PublicKey,
  timestamp: number
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("message"),
      thread.toBuffer(),
      sender.toBuffer(),
      new BN(timestamp).toArrayLike(Buffer, "le", 8),
    ],
    programID
  )[0];
}


// Blog App
// Returns the PDA for a user's profile.
export const getUserAddress = (authority: web3.PublicKey): web3.PublicKey => {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode('user'), authority.toBuffer()],
    programID
  );
  return pda;
};

// Returns the PDA for a specific post.
export const getPostAddress = (authority: PublicKey, title: string) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("post"),               // POST_SEED
    authority.toBuffer(),              // authority
    Buffer.from(title)                 // raw, untrimmed title
    ],
    programID
  )[0];
};





// export const initUser = async (name: string, avatar: string) => {

// const program = useProgram()
//   if (!program || !wallet) throw new Error("Wallet or program not ready");

//   const userAccount = getUserAddress(wallet.publicKey);

 
// };

 //Voting Dapp 
 

export const getCounterAddress = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
   programID // Replace with your actual program ID
  )[0];
};

export const getRegistrationAddress = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("registerations")],
   programID // Replace with your actual program ID
  )[0];
};

export const getPollAddress = (pollId: number) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("poll"), new BN(pollId).toArrayLike(Buffer, "le", 8)],
   programID // Replace with your actual program ID
  )[0];
};

export const getCandidateAddress = (pollId: number, candidateId: number) => {
  return PublicKey.findProgramAddressSync(
    [
      new BN(pollId).toArrayLike(Buffer, "le", 8),
      new BN(candidateId).toArrayLike(Buffer, "le", 8),
    ],
   programID // Replace with your actual program ID
  )[0];
};

export const getVoterAddress = (pollId: number, user: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("voter"), new BN(pollId).toArrayLike(Buffer, "le", 8), user.toBuffer()],
   programID // Replace with your actual program ID
  )[0];
};


//crowdfunding

// // Returns the PDA for a withdrawal transaction.
// export const getWithdrawTransactionAddress = (creator: PublicKey, cid: number, withdrawalCount: number): PublicKey => {
//   const [pda] = PublicKey.findProgramAddressSync(
//     [
//       anchor.utils.bytes.utf8.encode('withdraw'),
//       creator.toBuffer(),
//       new BN(cid).toBuffer('le', 8),
//       new BN(withdrawalCount).toBuffer('le', 8),
//     ],
//     programID
//   );
//   return pda;
// };

export const getProgramState = async (program: Program<any>) => {
  return await program.account.programState.fetch(getProgramStateAddress());
};

export const getCampaign = async (program: Program<any>, cid: number) => {
    return await program.account.campaign.fetch(getCampaignAddress(cid));
};

export const getAllCampaigns = async (program: Program<any>) => {
  return await program.account.campaign.all();
};

export const createCampaign = async (
  program: Program<any>,
  title: string,
  description: string,
  imageUrl: string,
  goal: number,
  wallet: any,
  programState: any
) => {
  const goalInLamports = new BN(goal);
  const nextCampaignId = new BN(programState.campaignCount + 1);
  const campaignPda = getCampaignAddress(nextCampaignId.toNumber());

  return await program.methods
    .createCampaign(title, description, imageUrl, goalInLamports)
    .accounts({
      programState: getProgramStateAddress(),
      campaign: campaignPda,
      creator: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};

export const donateToCampaign = async (
  program: Program<any>,
  cid: number,
  amount: number,
  wallet: any,
) => {
    const amountInLamports = new BN(amount);
    const campaign = await getCampaign(program, cid);
    const transactionPda = getDonorTransactionAddress(wallet.publicKey, cid, campaign.donors.toNumber() + 1);

    return await program.methods
      .donate(new BN(cid), amountInLamports)
      .accounts({
        campaign: getCampaignAddress(cid),
        transaction: transactionPda,
        donor: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
};

export const withdrawFromCampaign = async (
  program: Program<any>,
  cid: number,
  wallet: any,
) => {
    const campaign = await getCampaign(program, cid);
    const transactionPda = getWithdrawTransactionAddress(wallet.publicKey, cid, campaign.withdrawals.toNumber() + 1);
    
    // This is a placeholder as the provided Rust code has a platform address check
    // and a transaction account we can't fully implement without more info.
    // In a real scenario, you'd need the platform account's PDA or public key.
    const platformAddress = new PublicKey(wallet.pui); // REPLACE WITH YOUR PLATFORM ADDRESS

    return await program.methods
      .withdraw(new BN(cid))
      .accounts({
        campaign: getCampaignAddress(cid),
        transaction: transactionPda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        programState: getProgramStateAddress(),
        platformAddress,
      })
      .rpc();
};

export const deleteCampaign = async (
    program: Program<any>,
    cid: number,
    wallet: any,
) => {
    return await program.methods
        .deleteCampaign(new BN(cid))
        .accounts({
            campaign: getCampaignAddress(cid),
            creator: wallet.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
};
