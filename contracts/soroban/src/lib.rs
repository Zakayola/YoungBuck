#![no_std]

mod test;

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Vec,
};

/// A single transaction registry entry stored on-chain.
#[contracttype]
#[derive(Clone)]
pub struct TxEntry {
    /// Off-chain reference ID linking this entry to the platform database
    pub ref_id: String,
    pub sender: Address,
    pub recipient: Address,
    /// Net amount received by recipient (in stroops, after fee)
    pub amount: i128,
    /// Platform fee collected (in stroops)
    pub fee: i128,
    /// Ledger timestamp at time of deposit
    pub timestamp: u64,
    pub settled: bool,
}

/// Storage keys used to namespace contract state.
#[contracttype]
pub enum DataKey {
    EntryCount,
    Entry(u32),
    /// Fee in basis points (e.g. 30 = 0.3%)
    FeeBps,
    Admin,
}

#[contract]
pub struct LedgerContract;

#[contractimpl]
impl LedgerContract {
    /// Initialize the contract. Must be called once by the deployer.
    ///
    /// # Arguments
    /// * `admin`   - Address that can update the fee and settle entries
    /// * `fee_bps` - Platform fee in basis points (max 500 = 5%)
    pub fn init(env: Env, admin: Address, fee_bps: u32) {
        admin.require_auth();
        assert!(fee_bps <= 500, "fee too high — max 500 bps (5%)");
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::EntryCount, &0u32);
    }

    /// Record a new transaction entry on-chain.
    ///
    /// The sender authorises the call; the fee is deducted from `amount`
    /// and the net value is stored against the entry.
    ///
    /// Returns the index of the newly created entry.
    pub fn deposit(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        ref_id: String,
    ) -> u32 {
        sender.require_auth();
        assert!(amount > 0, "amount must be positive");

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::EntryCount)
            .unwrap_or(0);

        let fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::FeeBps)
            .unwrap_or(0);

        let fee = (amount * fee_bps as i128) / 10_000;
        let net = amount - fee;

        let entry = TxEntry {
            ref_id,
            sender,
            recipient,
            amount: net,
            fee,
            timestamp: env.ledger().timestamp(),
            settled: false,
        };

        env.storage().instance().set(&DataKey::Entry(count), &entry);
        env.storage()
            .instance()
            .set(&DataKey::EntryCount, &(count + 1));

        env.events().publish(
            (symbol_short!("deposit"), symbol_short!("entry")),
            count,
        );

        count
    }

    /// Mark an entry as settled. Only callable by the admin.
    pub fn settle(env: Env, index: u32) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialised");
        admin.require_auth();

        let mut entry: TxEntry = env
            .storage()
            .instance()
            .get(&DataKey::Entry(index))
            .expect("entry not found");

        entry.settled = true;
        env.storage().instance().set(&DataKey::Entry(index), &entry);
    }

    /// Update the platform fee. Only callable by the admin.
    pub fn set_fee_bps(env: Env, new_fee_bps: u32) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialised");
        admin.require_auth();
        assert!(new_fee_bps <= 500, "fee too high — max 500 bps (5%)");
        env.storage()
            .instance()
            .set(&DataKey::FeeBps, &new_fee_bps);
    }

    /// Returns the total number of recorded entries.
    pub fn entry_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::EntryCount)
            .unwrap_or(0)
    }

    /// Fetch a single entry by its sequential index.
    pub fn get_entry(env: Env, index: u32) -> TxEntry {
        env.storage()
            .instance()
            .get(&DataKey::Entry(index))
            .expect("entry not found")
    }

    /// Fetch a paginated slice of entries.
    pub fn get_entries(env: Env, offset: u32, limit: u32) -> Vec<TxEntry> {
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::EntryCount)
            .unwrap_or(0);

        let mut results = Vec::new(&env);
        let end = (offset + limit).min(count);

        for i in offset..end {
            if let Some(entry) = env.storage().instance().get(&DataKey::Entry(i)) {
                results.push_back(entry);
            }
        }

        results
    }

    /// Returns the current fee in basis points.
    pub fn fee_bps(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::FeeBps)
            .unwrap_or(0)
    }
}
