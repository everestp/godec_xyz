

// import { Connection } from '@solana/web3.js'
// import IDL from './idl/godecidl.json'
// import { AnchorProvider, Program ,BN } from '@coral-xyz/anchor'
// import { PublicKey ,LAMPORTS_PER_SOL } from '@solana/web3.js'

//  export const PROGRAM_ID = new PublicKey("GZGMTga8By8XW6vUHq5FUET93PcU9HhhSUa2mimEwSY5")

// // How to fecth the program

// export const getProgram = (connection,wallet)=>{
//     const provider = new AnchorProvider(connection ,wallet ,{
//         commitment:'confirmed'
//     })
//     const program = new Program(IDL ,PROGRAM_ID ,provider)
//     return program
// }



// //get counter address


// export const getCounter = async (program: Program<any>): Promise<BN> => {
//   try {
//     const [counterPDA] = PublicKey.findProgramAddressSync(
//       [Buffer.from('counter')],
//      PROGRAM_ID
//     );

//     const counter = await program.account.counter.fetch(counterPDA);

//     if (!counter) {
//       console.warn('No counter found, returning zero');
//       return new BN(0);
//     }

//     return counter.count;
//   } catch (error) {
//     console.error('Failed to retrieve counter:', error);
//     return new BN(-1);
//   }
// };



