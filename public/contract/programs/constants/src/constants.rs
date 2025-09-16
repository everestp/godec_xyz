use anchor_lang::prelude::*;

#[constant]
pub const NOTE_SEED: &[u8] = b"note";

#[constant]
pub const TODO_SEED: &[u8] = b"todo"; // fixed: use "post" for post accounts

#[constant]
pub const USER_SEED: &[u8] = b"user";

#[constant]
pub const POST_SEED: &[u8] = b"post"; // fixed: use "post" for post accounts
