import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export enum VoteError {
   PollCounterUnderflow = 'PollCounterUnderflow',
   VoterAlreadyVoted = 'VoterAlreadyVoted',
   CandidateAlreadyRegistered = 'CandidateAlreadyRegistered',
   InvalidDates = 'InvalidDates',
   CandidateNotRegistered = 'CandidateNotRegistered',
   PollNotActive = 'PollNotActive',
   PollDoesNotExist = 'PollDoesNotExist',
}

export enum ChatError {
   MessageTooLong = 'MessageTooLong',
}

export enum ErrorCode {
   AlreadyInitialized = 'AlreadyInitialized',
   TitleTooLong = 'TitleTooLong',
   DescriptionTooLong = 'DescriptionTooLong',
   ImageUrlTooLong = 'ImageUrlTooLong',
   InvalidGoalAmount = 'InvalidGoalAmount',
   Unauthorized = 'Unauthorized',
   CampaignNotFound = 'CampaignNotFound',
   InactiveCampaign = 'InactiveCampaign',
   InvalidDonationAmount = 'InvalidDonationAmount',
   CampaignGoalActualized = 'CampaignGoalActualized',
   InvalidWithdrawalAmount = 'InvalidWithdrawalAmount',
   InsufficientFund = 'InsufficientFund',
   InvalidPlatformAddress = 'InvalidPlatformAddress',
   InvalidPlatformFee = 'InvalidPlatformFee',
}

export enum TodoError {
   TaskTooLong = 'TaskTooLong',
   TaskEmpty = 'TaskEmpty',
   Unauthorized = 'Unauthorized',
}

export interface NoteAccount {
   author: PublicKey;
   title: string;
   content: string;
   createdAt: BN;
   lastUpdate: BN;
}

export interface TodoAccount {
   author: PublicKey;
   taskTitle: string;
   createdAt: BN;
   lastUpdate: BN;
   isCompleted: boolean;
}

export interface ProgramState {
   initialized: boolean;
   campaignCount: BN;
   platformFee: BN;
   platformAddress: PublicKey;
}

export interface Campaign {
   cid: BN;
   creator: PublicKey;
   title: string;
   description: string;
   imageUrl: string;
   goal: BN;
   amountRaised: BN;
   timestamp: BN;
   donors: BN;
   withdrawals: BN;
   balance: BN;
   active: boolean;
}

export interface Transaction {
   owner: PublicKey;
   cid: BN;
   amount: BN;
   timestamp: BN;
   credited: boolean;
}

export interface Poll {
   id: BN;
   description: string;
   start: BN;
   end: BN;
   candidates: BN;
}

export interface Counter {
   count: BN;
}

export interface Registerations {
   count: BN;
}

export interface Candidate {
   cid: BN;
   pollId: BN;
   name: string;
   votes: BN;
   hasRegistered: boolean;
}

export interface Voter {
   cid: BN;
   pollId: BN;
   hasVoted: boolean;
}

export interface UserAccount {
   name: string;
   avatar: string;
   authority: PublicKey;
   lastPostId: number;
   postCount: number;
}

export interface PostAccount {
   id: number;
   title: string;
   content: string;
   user: PublicKey;
   authority: PublicKey;
}

export interface MessageThread {
   participantA: PublicKey;
   participantB: PublicKey;
}

export interface Message {
   sender: PublicKey;
   timestamp: BN;
   content: string;
   thread: PublicKey;
}