use anchor_lang::prelude::*;


// ==============================
// Note Errors
// ==============================

#[error_code]
pub enum NotesError {
    #[msg("Title cannot be longer than 100 chars")]
    TitleTooLong,
    #[msg("Content cannot be longer than 1000 chars")]
    ContentTooLong,
    #[msg("Title cannot be empty")]
    TitleEmpty,
    #[msg("Content cannot be empty")]
    ContentEmpty,
    #[msg("Unauthorized")]
    Unauthorized,
}






//
// ==============================
//  Voting Dapp Errors
// ==============================
//



#[error_code]
pub enum VoteError {
    #[msg("Poll counter cannot be less than zero")]
    PollCounterUnderflow,
    #[msg("Voter cannot vote twice")]
    VoterAlreadyVoted,
    #[msg("Candidate cannot register twice")]
    CandidateAlreadyRegistered,
    #[msg("Start date cannot be greater than end date")]
    InvalidDates,
    #[msg("Candidate is not in the poll")]
    CandidateNotRegistered,
    #[msg("Poll not currently active")]
    PollNotActive,
    #[msg("Poll does not exist or not found")]
    PollDoesNotExist
}

//
// ==============================
//  Chat Dapp Errors
// ==============================
//




#[error_code]
pub enum ChatError {
    #[msg("Message content is too long (max 280 characters).")]
    MessageTooLong,
    #[msg("Sender is not authorized to send messages in this thread")]
    UnauthorizedThreadAccess,
}