// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ALXStakingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct StakeRecord {
        uint256 id;
        address user;
        uint256 principal;
        uint256 totalReward;
        uint256 startTime;
        uint256 claimedAmount;
        uint256 lockDuration;
        uint256 linearDuration;
        uint256 initialUnlockRate;
    }

    IERC20 public immutable stakingToken;
    uint256 public nextId = 1000;
    uint256 public totalStaked;

    uint256 public bonusRate = 5000;
    uint256 public initialUnlockRate = 1000;
    uint256 public lockDuration = 90 days;
    uint256 public linearDuration = 270 days;
    uint256 public withdrawFeeRate = 500; // 提现手续费率 (基点, 500 = 5%)

    mapping(address => uint256[]) public userStakeIds;
    mapping(uint256 => StakeRecord) public stakes;

    event Staked(address indexed user, uint256 indexed id, uint256 amount, uint256 totalReward);
    event Claimed(address indexed user, uint256 indexed id, uint256 amount);
    event ConfigUpdated(uint256 bonus, uint256 lockDay, uint256 linearDay, uint256 initialRate);

    constructor(address _tokenAddress, address _owner) Ownable(_owner) {
        require(_tokenAddress != address(0), "Invalid token");
        require(_owner != address(0), "Invalid owner");
        stakingToken = IERC20(_tokenAddress);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        _createRecord(msg.sender, _amount);
    }

    function claim(uint256 _stakeId) external nonReentrant {
        StakeRecord storage record = stakes[_stakeId];
        require(record.user == msg.sender, "Not owner");

        uint256 claimable = _calculateClaimable(record);
        uint256 pending = claimable - record.claimedAmount;

        require(pending > 0, "Nothing to claim yet");

        record.claimedAmount = claimable;

        uint256 fee = (pending * withdrawFeeRate) / 10000;
        uint256 actualAmount = pending - fee;
        stakingToken.safeTransfer(msg.sender, actualAmount);

        emit Claimed(msg.sender, _stakeId, actualAmount);
    }

    function adminStakeForUser(address _user, uint256 _amount) external onlyOwner {
        _createRecord(_user, _amount);
    }

    function updateConfig(
        uint256 _bonusRate,
        uint256 _lockDays,
        uint256 _linearDays,
        uint256 _initialUnlockRate
    ) external onlyOwner {
        bonusRate = _bonusRate;
        lockDuration = _lockDays * 1 days;
        linearDuration = _linearDays * 1 days;
        initialUnlockRate = _initialUnlockRate;
        emit ConfigUpdated(_bonusRate, _lockDays, _linearDays, _initialUnlockRate);
    }

    function setWithdrawFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate <= 10000, "Fee too high");
        withdrawFeeRate = _feeRate;
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    function _createRecord(address _user, uint256 _amount) internal {
        uint256 bonus = (_amount * bonusRate) / 10000;
        uint256 total = _amount + bonus;

        stakes[nextId] = StakeRecord({
            id: nextId,
            user: _user,
            principal: _amount,
            totalReward: total,
            startTime: block.timestamp,
            claimedAmount: 0,
            lockDuration: lockDuration,
            linearDuration: linearDuration,
            initialUnlockRate: initialUnlockRate
        });

        userStakeIds[_user].push(nextId);
        totalStaked += _amount;
        emit Staked(_user, nextId, _amount, total);

        nextId++;
    }

    function _calculateClaimable(StakeRecord memory r) internal view returns (uint256) {
        if (block.timestamp < r.startTime + r.lockDuration) {
            return 0;
        }

        uint256 initial = (r.totalReward * r.initialUnlockRate) / 10000;
        uint256 remaining = r.totalReward - initial;
        uint256 timePassed = block.timestamp - (r.startTime + r.lockDuration);

        uint256 linear = 0;
        if (timePassed >= r.linearDuration) {
            linear = remaining;
        } else {
            linear = (remaining * timePassed) / r.linearDuration;
        }

        return initial + linear;
    }

    function getPendingAmount(uint256 _stakeId) external view returns (uint256) {
        StakeRecord memory r = stakes[_stakeId];
        return _calculateClaimable(r) - r.claimedAmount;
    }

    function getUserIds(address _user) external view returns (uint256[] memory) {
        return userStakeIds[_user];
    }
}
