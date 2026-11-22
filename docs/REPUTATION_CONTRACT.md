# Reputation contract integration notes

## Stake tiers

`StakeTier.threshold` is a raw token amount in the token's smallest unit.
`StakeTier.multiplier` uses a 100-based scale: `100` means `1.0x`, `120` means
`1.2x`, and `150` means `1.5x`. Integrations should treat the multiplier as a
fixed-point value rather than a percentage or an unscaled integer.

## Stake token and balance

The contract stores the user's stake amount and its token denomination as a
pair. `get_stake_balance(user)` returns the amount, while
`get_stake_token(user)` returns the corresponding token contract address. The
token getter returns `None` before the user has recorded a stake; callers should
not infer a token from the numeric balance alone.

## Referral bonuses

`ReferralBonusRecord.amount` is already the pre-multiplied reputation-score
contribution. It is not the original referral payment or a raw token amount.
`weight` is the contribution weight used by decay calculations and `timestamp`
is the Unix time at which the contribution was recorded.

## Collaborative-editor authorization

The backend invalidates the Yjs job-authorization cache immediately after an
application is accepted and the job's `freelancerId` is assigned. This prevents
an earlier cache entry containing `freelancerId: null` from rejecting the newly
accepted freelancer until the cache TTL expires.
