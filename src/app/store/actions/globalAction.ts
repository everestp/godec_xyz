import { Candidate, GlobalState, Poll } from "@/pages/VotingApp";
import {PayloadAction}  from '@reduxjs/toolkit'


export const globalAction ={
  
     setCandidate: (state:GlobalState , action:PayloadAction<Candidate[]>)=>{
    state.candidates= action.payload

   },
    setPoll: (state:GlobalState , action:PayloadAction<Poll>)=>{
    state.poll= action.payload

   },
   setRegModal: (state:GlobalState , action:PayloadAction<string>)=>{
    state.regModal= action.payload

   }
}