

use anchor_lang::prelude::*;
// ==============================
// for Note DApp
// ==============================

#[account]
#[derive(Default)]
#[derive(InitSpace)]
pub struct NoteAccount {
    pub author: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(1000)]
    pub content: String,
    pub created_at: i64,
    pub last_update: i64,
}



// ==============================
// for Todo DApp
// ==============================
#[account]
#[derive(Default)]
#[derive(InitSpace)]
pub struct TodoAccount {
    pub author: Pubkey,
    #[max_len(100)]
    pub task_title: String,
    pub created_at: i64,
    pub last_update: i64,
    pub is_completed:bool,
}

//
// ==============================
// for Crowfunding DApp
// ==============================
//
// ============================
// On-chain state definitions
// ============================
#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub initialized: bool,
    pub campaign_count: u64,
    pub platform_fee: u64,
    pub platform_address: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub cid: u64,
    pub creator: Pubkey,
    #[max_len(64)]
    pub title: String,
    #[max_len(512)]
    pub description: String,
    #[max_len(256)]
    pub image_url: String,
    pub goal: u64,
    pub amount_raised: u64,
    pub timestamp: u64,
    pub donors: u64,
    pub withdrawals: u64,
    pub balance: u64,
    pub active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Transaction {
    pub owner: Pubkey,
    pub cid: u64,
    pub amount: u64,
    pub timestamp: u64,
    pub credited: bool,
}


//
// ==============================
// for Voting DApp
// ==============================

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,
    pub creator:Pubkey,
    #[max_len(280)]
    pub description: String,
    pub start: u64,
    pub end: u64,
    pub candidates: u64,
}

#[account]
pub struct Counter {
    pub count: u64,
}

#[account]
pub struct Registerations {
    pub count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub cid: u64,
    pub poll_id: u64,
    #[max_len(32)]
    pub name: String,
    pub votes: u64,
    pub has_registered: bool,
}



#[account]
pub struct Voter {
    pub cid: u64,
    pub poll_id: u64,
    pub has_voted: bool,
}







//
// ==============================
// for Blog-Site DApp
// ==============================

#[account]
#[derive(Default)]
pub struct  UserAccount {
pub name:String,   //4 +256
pub avatar:String,  // 4 + 2048
pub authority:Pubkey,  //32
pub last_post_id :u8, //1
pub post_count:u8, //1
}

#[account]
#[derive(Default)]
pub struct  PostAccount {
pub id:u8, //8
pub title:String, //4 +256
pub content:String, //4 + 2048
pub image_url:String, //4 +100
pub user :Pubkey, //32
pub authority :Pubkey //32

}



//
// ==============================
// for Chat DApp
// ==============================




#[account]
pub struct Thread {
    pub sender: Pubkey,
    pub recipient: Pubkey,
}

#[account]
pub struct Message {
    pub sender: Pubkey,
    pub thread: Pubkey,
    pub content: String,
    pub timestamp: i64,
}