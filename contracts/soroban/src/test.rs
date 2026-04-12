#[cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};
use std::format;

fn setup() -> (Env, Address, LedgerContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, LedgerContract);
    let client = LedgerContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    (env, admin, client)
}

#[test]
fn test_init_sets_fee_and_count() {
    let (env, admin, client) = setup();
    client.init(&admin, &30u32); // 0.3% fee
    assert_eq!(client.fee_bps(), 30);
    assert_eq!(client.entry_count(), 0);
}

#[test]
fn test_deposit_records_entry_and_deducts_fee() {
    let (env, admin, client) = setup();
    client.init(&admin, &100u32); // 1% fee

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let ref_id = String::from_str(&env, "tx-ref-001");

    let index = client.deposit(&sender, &recipient, &1_000_000_000i128, &ref_id);
    assert_eq!(index, 0);
    assert_eq!(client.entry_count(), 1);

    let entry = client.get_entry(&0);
    assert_eq!(entry.settled, false);
    // 1% fee on 1,000,000,000 stroops = 10,000,000 fee, net = 990,000,000
    assert_eq!(entry.fee, 10_000_000i128);
    assert_eq!(entry.amount, 990_000_000i128);
}

#[test]
fn test_settle_marks_entry() {
    let (env, admin, client) = setup();
    client.init(&admin, &0u32);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let ref_id = String::from_str(&env, "tx-ref-002");

    client.deposit(&sender, &recipient, &500_000i128, &ref_id);
    assert_eq!(client.get_entry(&0).settled, false);

    client.settle(&0u32);
    assert_eq!(client.get_entry(&0).settled, true);
}

#[test]
fn test_get_entries_pagination() {
    let (env, admin, client) = setup();
    client.init(&admin, &0u32);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    for i in 0..5u32 {
        let ref_id = String::from_str(&env, &format!("tx-ref-{i:03}"));
        client.deposit(&sender, &recipient, &100_000i128, &ref_id);
    }

    assert_eq!(client.entry_count(), 5);

    let page = client.get_entries(&0, &3);
    assert_eq!(page.len(), 3);

    let page2 = client.get_entries(&3, &3);
    assert_eq!(page2.len(), 2);
}

#[test]
fn test_set_fee_bps_updates_fee() {
    let (env, admin, client) = setup();
    client.init(&admin, &30u32);
    assert_eq!(client.fee_bps(), 30);
    client.set_fee_bps(&50u32);
    assert_eq!(client.fee_bps(), 50);
}
