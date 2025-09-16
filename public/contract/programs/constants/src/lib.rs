use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

pub mod constants;
pub mod states;
pub mod errors;

use crate::{constants::*, states::*, errors::*};

declare_id!("73KCAwnfEwU7LPX7Ri2FXHvp1NZtCyRUc6EJVvm59oEs");
// constants
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod godec_dapp {
    use super::*;

    // ==============================
    // Notes DApp
    // ==============================

    pub fn create_note(ctx: Context<CreateNote>, title: String, content: String) -> Result<()> {
        let note_account = &mut ctx.accounts.note_account;
        let clock = Clock::get()?;

        require!(title.len() <= 1000, NotesError::TitleTooLong);
        require!(content.len() <= 10000, NotesError::ContentTooLong);
        require!(!title.trim().is_empty(), NotesError::TitleEmpty);
        require!(!content.trim().is_empty(), NotesError::ContentEmpty);

        note_account.author = ctx.accounts.author.key();
        note_account.title = title.clone();
        note_account.content = content.clone();
        note_account.created_at = clock.unix_timestamp;
        note_account.last_update = clock.unix_timestamp;

        msg!(
            "Note created. Title: {} | Author: {} | Created at: {}",
            note_account.title,
            note_account.author,
            note_account.created_at
        );
        Ok(())
    }

    pub fn update_note(ctx: Context<UpdateNote>, update_content: String) -> Result<()> {
        let note = &mut ctx.accounts.note_account;
        let clock = Clock::get()?;

        require!(note.author == ctx.accounts.author.key(), NotesError::Unauthorized);
        require!(update_content.len() <= 1000, NotesError::ContentTooLong);
        require!(!update_content.trim().is_empty(), NotesError::ContentEmpty);

        note.content = update_content.clone();
        note.last_update = clock.unix_timestamp;

        msg!("Note: {} updated successfully", note.title);

        Ok(())
    }

    pub fn delete_note(ctx: Context<DeleteNote>) -> Result<()> {
        let note = &ctx.accounts.note_account;

        require!(note.author == ctx.accounts.author.key(), NotesError::Unauthorized);

        msg!("Note: {} deleted successfully", note.title);

        Ok(())
    }

    // ==============================
    // TODO DApp
    // ==============================

    pub fn create_task(ctx: Context<CreateTask>, task_title: String) -> Result<()> {
        let todo_account = &mut ctx.accounts.todo_account;
        let clock = Clock::get()?;

        require!(task_title.len() <= 1000, TodoError::TaskTooLong);
        require!(!task_title.trim().is_empty(), TodoError::TaskEmpty);

        todo_account.author = ctx.accounts.author.key();
        todo_account.task_title = task_title.clone();
        todo_account.created_at = clock.unix_timestamp;
        todo_account.last_update = clock.unix_timestamp;
        todo_account.is_completed = false;

        msg!(
            "Task created. Title: {} | Created at: {}",
            todo_account.task_title,
            todo_account.created_at
        );
        Ok(())
    }

    pub fn mark_complete(ctx: Context<MarkCompleted>) -> Result<()> {
        let todo_account = &mut ctx.accounts.todo_account;
        let clock = Clock::get()?;

        require!(todo_account.author == ctx.accounts.author.key(), TodoError::Unauthorized);

        todo_account.is_completed = true;
        todo_account.last_update = clock.unix_timestamp;

        msg!("Congratulations! Task: {} is Completed", todo_account.task_title);

        Ok(())
    }

    pub fn delete_task(ctx: Context<DeleteTask>) -> Result<()> {
        let todo_account = &ctx.accounts.todo_account;

        require!(todo_account.author == ctx.accounts.author.key(), TodoError::Unauthorized);
        msg!("Task: {} deleted successfully", todo_account.task_title);

        Ok(())
    }
    // ==============================
    //  Vote App
    // ==============================

pub fn initialize_vote(ctx: Context<InitializeVote>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;

        let registerations = &mut ctx.accounts.registerations;
        registerations.count = 0;
        Ok(())
    }

   pub fn create_poll(
    ctx: Context<CreatePoll>,
    poll_id: u64, // The ID is now an instruction argument
    description: String,
    start: u64,
    end: u64,
) -> Result<()> {
    if start >= end {
        return Err(errors::VoteError::InvalidDates.into());
    }

    let counter = &mut ctx.accounts.counter;
    if counter.count + 1 != poll_id {
        return Err(errors::VoteError::PollCounterUnderflow.into());
    }
    counter.count += 1;

    let poll = &mut ctx.accounts.poll;

    poll.id = poll_id; // Use the provided poll_id
    poll.description = description;
    poll.start = start;
    poll.end = end;
    poll.candidates = 0;
  poll.creator = ctx.accounts.user.key();

 Ok(())
} 

     pub fn register_candidate(
        ctx: Context<RegisterCandidate>,
        poll_id: u64,
        name: String,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        if poll.id != poll_id {
            return Err(errors::VoteError::PollDoesNotExist.into());
        }

        let candidate = &mut ctx.accounts.candidate;
        if candidate.has_registered {
            return Err(errors::VoteError::CandidateAlreadyRegistered.into());
        }

        let registerations = &mut ctx.accounts.registerations;
        registerations.count += 1;

        candidate.has_registered = true;
        candidate.cid = registerations.count;
        candidate.poll_id = poll_id;
        candidate.name = name;

        Ok(())
    }

 pub fn vote(ctx: Context<Vote>, poll_id: u64, cid: u64) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        let candidate = &mut ctx.accounts.candidate;
        let poll = &mut ctx.accounts.poll;

        if !candidate.has_registered || candidate.poll_id != poll_id {
            return Err(errors::VoteError::CandidateNotRegistered.into());
        }

        if voter.has_voted {
            return Err(errors::VoteError::VoterAlreadyVoted.into());
        }

        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        if current_timestamp < poll.start || current_timestamp > poll.end {
            return Err(errors::VoteError::PollNotActive.into());
        }

        voter.poll_id = poll_id;
        voter.cid = cid;
        voter.has_voted = true;

        candidate.votes += 1;

        Ok(())
    }




    // ==============================
    // Crowdfunding
    // ==============================

    // program setup
    pub fn initialize(ctx: Context<InitializeCtx>) -> Result<()> {
        let state = &mut ctx.accounts.program_state;
        let deployer = &ctx.accounts.deployer;

        if state.initialized {
            msg!("Program already initialized");
            return Err(ErrorCode::AlreadyInitialized.into());
        }

        state.campaign_count = 0;
        state.platform_fee = 5;
        state.platform_address = deployer.key();
        state.initialized = true;

        msg!("Program initialized successfully");
        Ok(())
    }

    // create a campaign
    pub fn create_campaign(
        ctx: Context<CreateCampaignCtx>,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let state = &mut ctx.accounts.program_state;

        if title.len() > 64 {
            msg!("Title length invalid");
            return Err(ErrorCode::TitleTooLong.into());
        }
        if description.len() > 512 {
            msg!("Description length invalid");
            return Err(ErrorCode::DescriptionTooLong.into());
        }
        if image_url.len() > 256 {
            msg!("Image URL length invalid");
            return Err(ErrorCode::ImageUrlTooLong.into());
        }
        if goal < 1_000_000_000 {
            msg!("Campaign goal too small");
            return Err(ErrorCode::InvalidGoalAmount.into());
        }

        state.campaign_count += 1;

        campaign.cid = state.campaign_count;
        campaign.creator = ctx.accounts.creator.key();
        campaign.title = title;
        campaign.description = description;
        campaign.image_url = image_url;
        campaign.goal = goal;
        campaign.amount_raised = 0;
        campaign.donors = 0;
        campaign.withdrawals = 0;
        campaign.timestamp = Clock::get()?.unix_timestamp as u64;
        campaign.active = true;
        campaign.balance = 0;

        msg!("New campaign successfully created");
        Ok(())
    }

    // edit campaign details
    pub fn update_campaign(
        ctx: Context<UpdateCampaignCtx>,
        cid: u64,
        title: String,
        description: String,
        image_url: String,
        goal: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let creator = &mut ctx.accounts.creator;

        if campaign.creator != creator.key() {
            msg!("Unauthorized attempt to update");
            return Err(ErrorCode::Unauthorized.into());
        }

        if campaign.cid != cid {
            msg!("Campaign ID mismatch");
            return Err(ErrorCode::CampaignNotFound.into());
        }

        if title.len() > 64 {
            msg!("Title exceeds limit");
            return Err(ErrorCode::TitleTooLong.into());
        }
        if description.len() > 512 {
            msg!("Description exceeds limit");
            return Err(ErrorCode::DescriptionTooLong.into());
        }
        if image_url.len() > 256 {
            msg!("Image URL exceeds limit");
            return Err(ErrorCode::ImageUrlTooLong.into());
        }
        if goal < 1_000_000_000 {
            msg!("Goal is too small");
            return Err(ErrorCode::InvalidGoalAmount.into());
        }

        campaign.title = title;
        campaign.description = description;
        campaign.image_url = image_url;
        campaign.goal = goal;

        msg!("Campaign updated successfully");
        Ok(())
    }

    // deactivate campaign
    pub fn delete_campaign(ctx: Context<DeleteCampaignCtx>, cid: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let creator = &mut ctx.accounts.creator;

        if campaign.creator != creator.key() {
            msg!("Unauthorized attempt to deactivate");
            return Err(ErrorCode::Unauthorized.into());
        }

        if campaign.cid != cid {
            msg!("Campaign not found");
            return Err(ErrorCode::CampaignNotFound.into());
        }

        if !campaign.active {
            msg!("Campaign already inactive");
            return Err(ErrorCode::InactiveCampaign.into());
        }

        campaign.active = false;

        msg!("Campaign successfully deactivated");
        Ok(())
    }

    // donate to campaign
    pub fn donate(ctx: Context<DonateCtx>, cid: u64, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donor = &mut ctx.accounts.donor;
        let transaction = &mut ctx.accounts.transaction;

        if campaign.cid != cid {
            msg!("Campaign does not exist for donation");
            return Err(ErrorCode::CampaignNotFound.into());
        }

        if !campaign.active {
            msg!("Inactive campaign — donation rejected");
            return Err(ErrorCode::InactiveCampaign.into());
        }

        if amount < 1_000_000 {
            msg!("Donation is less than 0.0001 SOL");
            return Err(ErrorCode::InvalidDonationAmount.into());
        }

        if campaign.amount_raised >= campaign.goal {
            msg!("Target already achieved");
            return Err(ErrorCode::CampaignGoalActualized.into());
        }

        let tx_instruction = system_instruction::transfer(
            &donor.key(),
            &campaign.key(),
            amount,
        );

        let result = invoke(
            &tx_instruction,
            &[donor.to_account_info(), campaign.to_account_info()],
        );

        if let Err(_e) = result {
            msg!("Failed to transfer donation");
            return Err(ErrorCode::InsufficientFund.into());
        }

        campaign.amount_raised += amount;
        campaign.balance += amount;
        campaign.donors += 1;

        transaction.amount = amount;
        transaction.cid = cid;
        transaction.owner = donor.key();
        transaction.timestamp = Clock::get()?.unix_timestamp as u64;
        transaction.credited = true;

        msg!("Donation processed successfully");
        Ok(())
    }

     // withdraw funds from a campaign
    pub fn withdraw(ctx: Context<WithdrawCtx>, cid: u64, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let creator = &ctx.accounts.creator;
        let transaction = &mut ctx.accounts.transaction;
        let state = &mut ctx.accounts.program_state;
        let platform_account_info = &ctx.accounts.platform_address;

        if campaign.cid != cid {
            msg!("Campaign not found for withdrawal");
            return Err(ErrorCode::CampaignNotFound.into());
        }

        if campaign.creator != creator.key() {
            msg!("Unauthorized withdrawal attempt");
            return Err(ErrorCode::Unauthorized.into());
        }

        //fixing the amount such that  less than 1 sol cant be deducted
        if amount < 1_000_000_000 {
            msg!("Withdrawal amount too low");
            return Err(ErrorCode::InvalidWithdrawalAmount.into());
        }

        if amount > campaign.balance {
            msg!("Withdrawal exceeds campaign balance");
            return Err(ErrorCode::CampaignGoalActualized.into());
        }

        if platform_account_info.key() != state.platform_address {
            msg!("Invalid platform address for withdrawal");
            return Err(ErrorCode::InvalidPlatformAddress.into());
        }

        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        if amount > **campaign.to_account_info().lamports.borrow() - rent_balance {
            msg!("Withdrawal exceeds campaign's usable balance");
            return Err(ErrorCode::InsufficientFund.into());
        }

        let platform_fee = amount * state.platform_fee / 100;
        let creator_amount = amount - platform_fee;

        **campaign.to_account_info().try_borrow_mut_lamports()? -= creator_amount;
        **creator.to_account_info().try_borrow_mut_lamports()? += creator_amount;

        **campaign.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
        **platform_account_info.to_account_info().try_borrow_mut_lamports()? += platform_fee;

        campaign.withdrawals += 1;
        campaign.balance -= amount;

        transaction.amount = amount;
        transaction.cid = cid;
        transaction.owner = creator.key();
        transaction.timestamp = Clock::get()?.unix_timestamp as u64;
        transaction.credited = false;

        msg!("Withdrawal successful");
        Ok(())
    }

    // update platform settings
    pub fn update_platform_settings(
        ctx: Context<UpdatePlatformSettingsCtx>,
        new_platform_fee: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.program_state;
        let updater = &ctx.accounts.updater;

        if updater.key() != state.platform_address {
            msg!("Unauthorized update attempt");
            return Err(ErrorCode::Unauthorized.into());
        }

        if !(1..=15).contains(&new_platform_fee) {
            msg!("Fee percentage not within range");
            return Err(ErrorCode::InvalidPlatformFee.into());
        }

        state.platform_fee = new_platform_fee;

        msg!("Platform settings updated");
        Ok(())
    }


    // ==============================
    // Blog Site
    // ==============================

 pub fn init_user(ctx: Context<InitUser>, name: String, avatar: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let authority = &ctx.accounts.authority;

        user_account.name = name;
        user_account.avatar = avatar;
        user_account.last_post_id = 0;
        user_account.post_count = 0;
        user_account.authority = authority.key();

        Ok(())
    }

  pub fn create_post(
    ctx: Context<CreatePost>,
    title: String,
    content: String,
    image_url: String,
) -> Result<()> {
    let post_account = &mut ctx.accounts.post_account;
    let user_account = &mut ctx.accounts.user_account;
    let authority = &ctx.accounts.authority;

    post_account.id = user_account.last_post_id;
    post_account.title = title.clone();
    post_account.content = content;
    post_account.image_url = image_url;
    post_account.user = user_account.key();
    post_account.authority = authority.key();

    // Update user stats
    user_account.last_post_id = user_account
        .last_post_id
        .checked_add(1)
        .unwrap();

    user_account.post_count = user_account
        .post_count
        .checked_add(1)
        .unwrap();

    Ok(())
}

// FOr update Post 

pub fn update_post(
    ctx: Context<UpdatePost>,
    content: String,
    image_url: String,
) -> Result<()> {
    let post_account = &mut ctx.accounts.post_account;
    let authority = &ctx.accounts.authority;

    require_keys_eq!(post_account.authority, authority.key(), TodoError::Unauthorized);

    // ❌ Don't change the title (it's tied to PDA)
    post_account.content = content;
    post_account.image_url = image_url;

    Ok(())
}
pub fn delete_post(ctx: Context<DeletePost>, title: String) -> Result<()> {
    let post_account = &mut ctx.accounts.post_account;
    let user_account = &mut ctx.accounts.user_account;
    let authority = &ctx.accounts.authority;

    require_keys_eq!(post_account.authority, authority.key(),  TodoError::Unauthorized);

    // Decrease post count
    user_account.post_count = user_account
        .post_count
        .checked_sub(1)
        .unwrap();

    // Close the account
    Ok(post_account.close(authority.to_account_info())?)
}


//
// ==============================
//  Chat Dapp Function
// ==============================
//

pub fn initialize_thread(ctx: Context<InitializeThread>) -> Result<()> {
        let thread = &mut ctx.accounts.thread;
        thread.sender = ctx.accounts.sender.key();
        thread.recipient = ctx.accounts.recipient.key();
        Ok(())
    }

    pub fn send_message(ctx: Context<SendMessage>, content: String, timestamp: i64) -> Result<()> {
        let message = &mut ctx.accounts.message;
        message.sender = ctx.accounts.sender.key();
        message.thread = ctx.accounts.thread.key();
        message.content = content;
        message.timestamp = timestamp;
        Ok(())
    }




}

// ==============================
// Contexts
// ==============================

// Notes
#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateNote<'info> {
    #[account(
        init,
        seeds = [NOTE_SEED, author.key().as_ref(), title.as_bytes()],
        bump,
        payer = author,
        space = 8 + NoteAccount::INIT_SPACE,
    )]
    pub note_account: Account<'info, NoteAccount>,

    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateNote<'info> {
    #[account(
        mut,
        seeds = [NOTE_SEED, author.key().as_ref(), note_account.title.as_bytes()],
        bump,
    )]
    pub note_account: Account<'info, NoteAccount>,

    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteNote<'info> {
    #[account(
        mut,
        seeds = [NOTE_SEED, author.key().as_ref(), note_account.title.as_bytes()],
        bump,
        close = author
    )]
    pub note_account: Account<'info, NoteAccount>,

    #[account(mut)]
    pub author: Signer<'info>,
}

// TODO
#[derive(Accounts)]
#[instruction(task_title: String)]
pub struct CreateTask<'info> {
    #[account(
        init,
        seeds = [TODO_SEED, author.key().as_ref(), task_title.as_bytes()],
        bump,
        payer = author,
        space = 8 + TodoAccount::INIT_SPACE,
    )]
    pub todo_account: Account<'info, TodoAccount>,

    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkCompleted<'info> {
    #[account(
        mut,
        seeds = [TODO_SEED, author.key().as_ref(), todo_account.task_title.as_bytes()],
        bump,
    )]
    pub todo_account: Account<'info, TodoAccount>,

    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    #[account(
        mut,
        seeds = [TODO_SEED, author.key().as_ref(), todo_account.task_title.as_bytes()],
        bump,
        close = author
    )]
    pub todo_account: Account<'info, TodoAccount>,

    #[account(mut)]
    pub author: Signer<'info>,
}




//Chat App








// Crowdfunding

#[derive(Accounts)]
pub struct InitializeCtx<'info>{
    #[account(
        init,
        payer = deployer,
        space = 8 + ProgramState::INIT_SPACE,
        seeds=[b"program_state"],
        bump
    )]
    pub program_state:Account<'info,ProgramState>,
    #[account(mut)]
    pub deployer :Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCampaignCtx<'info> {
    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINATOR_SIZE + Campaign::INIT_SPACE,
        seeds = [
            b"campaign",
            (program_state.campaign_count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct UpdateCampaignCtx<'info> {
    #[account(
        mut,
        seeds = [
            b"campaign",
            cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct DeleteCampaignCtx<'info> {
    #[account(
        mut,
        seeds = [
            b"campaign",
            cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct DonateCtx<'info> {
    #[account(
        mut,
        seeds = [
            b"campaign",
            cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = donor,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            b"donor",
            donor.key().as_ref(),
            cid.to_le_bytes().as_ref(),
            (campaign.donors + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,

    #[account(mut)]
    pub donor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cid: u64)]
pub struct WithdrawCtx<'info> {
    #[account(
        mut,
        seeds = [
            b"campaign",
            cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINATOR_SIZE + Transaction::INIT_SPACE,
        seeds = [
            b"withdraw",
            creator.key().as_ref(),
            cid.to_le_bytes().as_ref(),
            (campaign.withdrawals + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,

    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,

    /// CHECK: this is the platform's account which must match program_state.platform_address
    #[account(mut)]
    pub platform_address: AccountInfo<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlatformSettingsCtx<'info> {
    #[account(mut)]
    pub updater: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
}

// ==============================
// Vote Dapp Context
// ==============================
#[derive(Accounts)]
#[instruction(poll_id: u64, description: String, start: u64, end: u64)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"counter"],
        bump,
    )]
    pub counter: Account<'info, Counter>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE,
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()], // Use the poll_id from the instruction
        bump,
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct InitializeVote<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
      init,
      payer = user,
      space = ANCHOR_DISCRIMINATOR_SIZE + 8,
      seeds = [b"counter"],
      bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(
      init,
      payer = user,
      space = ANCHOR_DISCRIMINATOR_SIZE + 8,
      seeds = [b"registerations"],
      bump
    )]
    pub registerations: Account<'info, Registerations>,

    pub system_program: Program<'info, System>,
}

//Register COntex fro vote  Dapp
#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct RegisterCandidate<'info> {
    #[account(
        mut,
        seeds = [ b"poll" ,poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init, // Create the voter account if it doesn't exist
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Candidate::INIT_SPACE, // Account size
        seeds = [
            poll_id.to_le_bytes().as_ref(),
            (registerations.count + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, // Modify the `registerations` account
    )]
    pub registerations: Account<'info, Registerations>,

    pub system_program: Program<'info, System>,
}


// Vote Context
#[derive(Accounts)]
#[instruction(poll_id: u64, cid: u64)]
pub struct Vote<'info> {
    #[account(
        mut,
        seeds = [b"poll" ,poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>, // Poll to be voted in

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), cid.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>, // Candidate to receive the vote

    #[account(
        init, // Create the voter account if it doesn't exist
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 25, // Account size
        seeds = [b"voter", poll_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>, // Unique per poll and user

    #[account(mut)]
    pub user: Signer<'info>, // Voter's signer account

    pub system_program: Program<'info, System>,
}












//Blog Contexst

#[derive(Accounts)]
#[instruction()]
pub struct InitUser<'info> {
    #[account(
        init,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        payer = authority,
        space = 2318+8
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(title: String)] // You must pass title here!
pub struct CreatePost<'info> {
    #[account(
        init,
        seeds = [POST_SEED, authority.key().as_ref(), title.as_bytes()],
        bump,
        payer = authority,
        space = 8 + 2376 + 204, // Adjust this based on your actual account size
    )]
    pub post_account: Account<'info, PostAccount>,

    #[account(
        mut,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdatePost<'info> {
    #[account(
        mut,
        seeds = [POST_SEED, authority.key().as_ref(), title.as_bytes()],
        bump,
        has_one = authority
    )]
    pub post_account: Account<'info, PostAccount>,

    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub user_account: Account<'info, UserAccount>,

    pub authority: Signer<'info>,
}
#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeletePost<'info> {
    #[account(
        mut,
        seeds = [POST_SEED, authority.key().as_ref(), title.as_bytes()],
        bump,
        has_one = authority,
        close = authority
    )]
    pub post_account: Account<'info, PostAccount>,

    #[account(
        mut,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub user_account: Account<'info, UserAccount>,

    pub authority: Signer<'info>,
}


//
// ==============================
//  Chat Dapp Context
// ==============================
//




#[derive(Accounts)]
pub struct InitializeThread<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + 32 + 32, // Discriminator (8) + sender pubkey (32) + recipient pubkey (32)
        seeds = [b"thread", sender.key().as_ref(), recipient.key().as_ref()],
        bump
    )]
    pub thread: Account<'info, Thread>,
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient is just a public key, no need to validate as signer
    pub recipient: AccountInfo<'info>,
   
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content: String, timestamp: i64)]
pub struct SendMessage<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + 32 + 32 + 4 + content.len() + 8, // Discriminator (8) + sender (32) + thread (32) + content length (4) + content + timestamp (8)
        seeds = [b"message", thread.key().as_ref(), sender.key().as_ref(), timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub message: Account<'info, Message>,
    #[account(
        constraint = thread.sender == sender.key() || thread.recipient == sender.key() @ ChatError::UnauthorizedThreadAccess
    )]
    pub thread: Account<'info, Thread>,
    #[account(mut)]
    pub sender: Signer<'info>,
   
    pub system_program: Program<'info, System>,
}




























// ==============================
//Errors
// ==============================


// ==============================
// Crowdfunding Errors
// ==============================

#[error_code]
pub enum ErrorCode {
    #[msg("This program is already initialized.")]
    AlreadyInitialized,
    #[msg("Title length exceeds the allowed 64 characters.")]
    TitleTooLong,
    #[msg("Description length exceeds the allowed 512 characters.")]
    DescriptionTooLong,
    #[msg("Image URL length exceeds the allowed 256 characters.")]
    ImageUrlTooLong,
    #[msg("Goal amount must be greater than zero.")]
    InvalidGoalAmount,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("The specified campaign does not exist.")]
    CampaignNotFound,
    #[msg("The campaign is currently inactive.")]
    InactiveCampaign,
    #[msg("Donation must be at least 1 SOL.")]
    InvalidDonationAmount,
    #[msg("This campaign has already met its target.")]
    CampaignGoalActualized,
    #[msg("Minimum withdrawal amount is 1 SOL.")]
    InvalidWithdrawalAmount,
    #[msg("Not enough funds available in this campaign.")]
    InsufficientFund,
    #[msg("The provided platform account is not valid.")]
    InvalidPlatformAddress,
    #[msg("Platform fee percentage is out of range.")]
    InvalidPlatformFee,
}


// ==============================
// Todo Errors
// ==============================

#[error_code]
pub enum TodoError {
    #[msg("Task cannot be longer than 100 chars")]
    TaskTooLong,

    #[msg("Title cannot be empty")]
    TaskEmpty,

    #[msg("Unauthorized")]
    Unauthorized,
}


