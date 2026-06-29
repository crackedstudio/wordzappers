// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  WordZapper
 * @notice Self-contained reward vault for the WordZapper daily word-ladder game
 *         on Celo. Distributes G$ to verified GoodDollar citizens — one reward
 *         per real human per day. No backend required.
 *
 * G$ is held directly in this contract. Anyone can fund the pool.
 * Sybil resistance comes from GoodDollar's Identity contract (face verification).
 * Score validation is protected by economic triviality: max reward is ~$0.002,
 * not worth exploiting for any verified human.
 *
 * Celo mainnet addresses:
 *   G$:      0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A
 *   Identity:0xC361A6E67822a0EDc17D899227dd9FC50BD62F42
 */
contract WordZapper {

    // ── Constants ──────────────────────────────────────────────────────────

    IERC20   public immutable G$;
    IIdentity public immutable IDENTITY;

    uint256 public constant TIER1_REWARD  = 0.05  ether; // 0.05  G$ — completed
    uint256 public constant TIER2_REWARD  = 0.12  ether; // 0.12  G$ — fast solve
    uint256 public constant TIER3_REWARD  = 0.20  ether; // 0.20  G$ — optimal path
    uint256 public constant STREAK_BONUS  = 0.03  ether; // +0.03 G$ if streak ≥ 3 days
    uint256 public constant DAILY_CAP     = 20    ether; // 20 G$ max distributed per day

    // ── Storage ────────────────────────────────────────────────────────────

    address public owner;

    struct Entry {
        uint64  score;
        uint8   tier;
        uint32  streak;
        uint64  timestamp;
    }

    /// player → unix-day → entry
    mapping(address => mapping(uint256 => Entry)) public entries;

    /// day → total G$ distributed that day
    mapping(uint256 => uint256) public dailyDistributed;

    // ── Events ─────────────────────────────────────────────────────────────

    event RewardClaimed(
        address indexed player,
        uint256 indexed day,
        uint256 score,
        uint8   tier,
        uint32  streak,
        uint256 reward
    );
    event PoolFunded(address indexed funder, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    // ── Errors ─────────────────────────────────────────────────────────────

    error NotCitizen();
    error AlreadyPlayed();
    error InvalidTier();
    error DailyCapReached();
    error InsufficientPool();
    error Unauthorized();

    // ── Setup ──────────────────────────────────────────────────────────────

    constructor(address _g$, address _identity) {
        G$       = IERC20(_g$);
        IDENTITY = IIdentity(_identity);
        owner    = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ── Core ───────────────────────────────────────────────────────────────

    /**
     * @notice Claim your daily G$ reward.
     * @param score  Final score from the completed puzzle (display only, not validated on-chain)
     * @param tier   1 = completed, 2 = fast (<2 min or <8 steps), 3 = optimal path
     */
    function claimReward(uint64 score, uint8 tier) external {
        // Only face-verified GoodDollar citizens
        if (!IDENTITY.isWhitelisted(msg.sender)) revert NotCitizen();

        uint256 day = _today();

        // One claim per citizen per day
        if (entries[msg.sender][day].timestamp != 0) revert AlreadyPlayed();

        // Tier must be 1, 2, or 3
        if (tier == 0 || tier > 3) revert InvalidTier();

        // Compute base reward
        uint256 reward = _tierReward(tier);

        // Streak: count consecutive prior days (stored, O(1))
        uint32 streak = _computeStreak(msg.sender, day);
        if (streak >= 3) reward += STREAK_BONUS;

        // Daily pool protection
        if (dailyDistributed[day] + reward > DAILY_CAP) revert DailyCapReached();
        if (G$.balanceOf(address(this)) < reward)        revert InsufficientPool();

        // Write state before external call (checks-effects-interactions)
        entries[msg.sender][day] = Entry({
            score:     score,
            tier:      tier,
            streak:    streak,
            timestamp: uint64(block.timestamp)
        });
        dailyDistributed[day] += reward;

        bool ok = G$.transfer(msg.sender, reward);
        require(ok, "Transfer failed");

        emit RewardClaimed(msg.sender, day, score, tier, streak, reward);
    }

    // ── Funding ────────────────────────────────────────────────────────────

    /// Anyone can fund the prize pool. Requires prior G$.approve(address(this), amount).
    function fundPool(uint256 amount) external {
        bool ok = G$.transferFrom(msg.sender, address(this), amount);
        require(ok, "TransferFrom failed");
        emit PoolFunded(msg.sender, amount);
    }

    // ── Views ──────────────────────────────────────────────────────────────

    function today() external view returns (uint256) {
        return _today();
    }

    function poolBalance() external view returns (uint256) {
        return G$.balanceOf(address(this));
    }

    function hasPlayedToday(address player) external view returns (bool) {
        return entries[player][_today()].timestamp != 0;
    }

    function isCitizen(address player) external view returns (bool) {
        return IDENTITY.isWhitelisted(player);
    }

    function getEntry(address player, uint256 day)
        external view returns (Entry memory)
    {
        return entries[player][day];
    }

    function remainingTodayCap() external view returns (uint256) {
        uint256 used = dailyDistributed[_today()];
        return used >= DAILY_CAP ? 0 : DAILY_CAP - used;
    }

    // ── Admin ──────────────────────────────────────────────────────────────

    function withdraw(address to, uint256 amount) external onlyOwner {
        bool ok = G$.transfer(to, amount);
        require(ok, "Transfer failed");
        emit Withdrawn(to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // ── Internal ───────────────────────────────────────────────────────────

    function _today() internal view returns (uint256) {
        return block.timestamp / 86400;
    }

    function _tierReward(uint8 tier) internal pure returns (uint256) {
        if (tier == 3) return TIER3_REWARD;
        if (tier == 2) return TIER2_REWARD;
        return TIER1_REWARD;
    }

    /// Walk backward through daily entries to count consecutive streak.
    /// Capped at 30 to bound gas usage.
    function _computeStreak(address player, uint256 day)
        internal view returns (uint32)
    {
        uint32 streak = 1;
        for (uint256 d = day - 1; streak < 30; d--) {
            if (entries[player][d].timestamp == 0) break;
            streak++;
            if (d == 0) break;
        }
        return streak;
    }
}

// ── Interfaces ─────────────────────────────────────────────────────────────

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IIdentity {
    function isWhitelisted(address user) external view returns (bool);
}
