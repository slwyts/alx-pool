// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

/**
 * @title ALX Staking Pool
 * @notice 核心逻辑：存币生息 + 锁仓 + 线性释放
 * @dev 采用了 OpenZeppelin 标准库保证安全性
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ALXStakingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- 数据结构 ---
    struct StakeRecord {
        uint256 id;             // 订单号 (例如: 8888)
        address user;           // 用户地址
        uint256 principal;      // 本金
        uint256 totalReward;    // 总权益 (本金+奖励)
        uint256 startTime;      // 开始时间 (秒)
        uint256 claimedAmount;  // 已提现金额
        
        // 记录当时的规则快照 (Snapshots)
        uint256 lockDuration;       // 锁仓期
        uint256 linearDuration;     // 释放期
        uint256 initialUnlockRate;  // 首期解锁比例
    }

    // --- 状态变量 ---
    IERC20 public immutable stakingToken; // ALX 代币地址
    uint256 public nextId = 8888;         // ID从8888开始

    // 默认配置 (基点: 10000 = 100%)
    uint256 public bonusRate = 5000;          // 50% 奖励
    uint256 public initialUnlockRate = 1000;  // 10% 首期解锁
    uint256 public lockDuration = 88 days;    // 88天 锁仓
    uint256 public linearDuration = 270 days; // 270天 线性释放

    // 存储映射
    mapping(address => uint256[]) public userStakeIds; // 用户 -> ID列表
    mapping(uint256 => StakeRecord) public stakes;     // ID -> 订单详情

    // --- 事件 (前端监听用) ---
    event Staked(address indexed user, uint256 indexed id, uint256 amount, uint256 totalReward);
    event Claimed(address indexed user, uint256 indexed id, uint256 amount);
    event ConfigUpdated(uint256 bonus, uint256 lockDay, uint256 linearDay);

    // 构造函数：部署时传入 ALX 代币地址和合约 owner（项目方）
    // 注意：OpenZeppelin 的 Ownable 在当前版本需要传入初始 owner
    constructor(address _tokenAddress, address _owner) Ownable(_owner) {
        require(_tokenAddress != address(0), "Invalid token");
        require(_owner != address(0), "Invalid owner");
        stakingToken = IERC20(_tokenAddress);
    }

    // ================= 核心功能 =================

    /**
     * @dev 用户自己质押
     */
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        
        // 1. 把币转进来
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);

        // 2. 创建记录
        _createRecord(msg.sender, _amount);
    }

    /**
     * @dev 提现/领取收益
     * @param _stakeId 订单ID
     */
    function claim(uint256 _stakeId) external nonReentrant {
        StakeRecord storage record = stakes[_stakeId];
        require(record.user == msg.sender, "Not owner");
        
        // 计算当前这一秒能提多少
        uint256 claimable = _calculateClaimable(record);
        uint256 pending = claimable - record.claimedAmount;
        
        require(pending > 0, "Nothing to claim yet");

        // 更新已提现额度
        record.claimedAmount = claimable;
        
        // 转账
        stakingToken.safeTransfer(msg.sender, pending);
        
        emit Claimed(msg.sender, _stakeId, pending);
    }

    // ================= 管理员功能 (Project Owner) =================

    /**
     * @dev 后台录入 (代客质押)
     * 场景：大户线下打钱给项目方，项目方在这里帮他录入
     */
    function adminStakeForUser(address _user, uint256 _amount) external onlyOwner {
        // 确保合约里有足够的币赔付 (或者先由管理员转入)
        // 这里假设管理员已经把币转入合约池子，或者合约本身就是金库
        _createRecord(_user, _amount);
    }

    /**
     * @dev 修改规则 (比如活动期把奖励改成 80%)
     */
    function updateConfig(
        uint256 _bonusRate,
        uint256 _lockDays,
        uint256 _linearDays
    ) external onlyOwner {
        bonusRate = _bonusRate;
        lockDuration = _lockDays * 1 days;
        linearDuration = _linearDays * 1 days;
        emit ConfigUpdated(_bonusRate, _lockDays, _linearDays);
    }

    /**
     * @dev 紧急提币 (防止有人误转其他币进来)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    // ================= 内部逻辑 (Math) =================

    function _createRecord(address _user, uint256 _amount) internal {
        // 计算奖励：本金 * (1 + 50%)
        uint256 bonus = (_amount * bonusRate) / 10000;
        uint256 total = _amount + bonus;

        // 记录进账
        stakes[nextId] = StakeRecord({
            id: nextId,
            user: _user,
            principal: _amount,
            totalReward: total,
            startTime: block.timestamp,
            claimedAmount: 0,
            // 关键：快照当前规则，防止未来改规则影响老用户
            lockDuration: lockDuration,
            linearDuration: linearDuration,
            initialUnlockRate: initialUnlockRate
        });

        userStakeIds[_user].push(nextId);
        emit Staked(_user, nextId, _amount, total);
        
        nextId++; // ID自增 (8888 -> 8889)
    }

    /**
     * @dev 核心算法：计算当前应该释放多少币
     */
    function _calculateClaimable(StakeRecord memory r) internal view returns (uint256) {
        // 1. 如果还在锁仓期 (例如前88天)，一分钱不给
        if (block.timestamp < r.startTime + r.lockDuration) {
            return 0;
        }

        // 2. 过了锁仓期，先给首期 (10%)
        uint256 initial = (r.totalReward * r.initialUnlockRate) / 10000;

        // 3. 计算线性部分 (90%)
        uint256 remaining = r.totalReward - initial;
        uint256 timePassed = block.timestamp - (r.startTime + r.lockDuration);
        
        uint256 linear = 0;
        if (timePassed >= r.linearDuration) {
            linear = remaining; // 假如时间过完了，给全部
        } else {
            // 假如还在270天内，按秒计算比例
            linear = (remaining * timePassed) / r.linearDuration;
        }

        return initial + linear;
    }

    // ================= 前端查询接口 =================

    // 获取某条订单当前可提现金额 (Pending)
    function getPendingAmount(uint256 _stakeId) external view returns (uint256) {
        StakeRecord memory r = stakes[_stakeId];
        return _calculateClaimable(r) - r.claimedAmount;
    }

    // 获取用户所有订单ID
    function getUserIds(address _user) external view returns (uint256[] memory) {
        return userStakeIds[_user];
    }
}
