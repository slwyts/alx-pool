import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, getAddress } from "viem";
import type { Address } from "viem";

describe("ALXStakingPool", async function () {
  const { viem, networkHelpers } = await network.connect();
  const [owner, user1, user2] = await viem.getWalletClients();

  // 时间常量（秒）
  const DAY = 86400;
  const LOCK_DURATION = 88 * DAY;
  const LINEAR_DURATION = 270 * DAY;

  // 基点常量
  const BASIS_POINTS = 10000n;
  const BONUS_RATE = 5000n; // 50%
  const INITIAL_UNLOCK_RATE = 1000n; // 10%

  // 测试金额
  const STAKE_AMOUNT = parseEther("1000");

  // Fixture: 部署合约
  async function deployFixture() {
    const token = await viem.deployContract("MockALX");
    const pool = await viem.deployContract("ALXStakingPool", [
      token.address,
      owner.account.address,
    ]);
    return { token, pool };
  }

  // 辅助函数：准备用户质押
  async function setupUserStake(
    token: Awaited<ReturnType<typeof deployFixture>>["token"],
    pool: Awaited<ReturnType<typeof deployFixture>>["pool"],
    userAddress: Address,
    userAccount: typeof user1.account,
    amount: bigint
  ) {
    await token.write.mint([userAddress, amount]);
    await token.write.approve([pool.address, amount], { account: userAccount });
  }

  describe("部署", function () {
    it("应该正确设置代币地址和 owner", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);

      assert.equal(
        getAddress(await pool.read.stakingToken()),
        getAddress(token.address)
      );
      assert.equal(
        getAddress(await pool.read.owner()),
        getAddress(owner.account.address)
      );
    });

    it("应该正确设置默认配置", async function () {
      const { pool } = await networkHelpers.loadFixture(deployFixture);

      assert.equal(await pool.read.bonusRate(), BONUS_RATE);
      assert.equal(await pool.read.initialUnlockRate(), INITIAL_UNLOCK_RATE);
      assert.equal(await pool.read.lockDuration(), BigInt(LOCK_DURATION));
      assert.equal(await pool.read.linearDuration(), BigInt(LINEAR_DURATION));
      assert.equal(await pool.read.nextId(), 8888n);
    });

    it("代币地址为零应该失败", async function () {
      await assert.rejects(
        viem.deployContract("ALXStakingPool", [
          "0x0000000000000000000000000000000000000000",
          owner.account.address,
        ]),
        /Invalid token/
      );
    });

    it("owner 地址为零应该失败", async function () {
      const { token } = await networkHelpers.loadFixture(deployFixture);
      await assert.rejects(
        viem.deployContract("ALXStakingPool", [
          token.address,
          "0x0000000000000000000000000000000000000000",
        ]),
        /OwnableInvalidOwner/
      );
    });
  });

  describe("质押 (stake)", function () {
    it("用户应该能够成功质押", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const stake = await pool.read.stakes([8888n]);
      assert.equal(getAddress(stake[1]), getAddress(user1.account.address));
      assert.equal(stake[2], STAKE_AMOUNT);
      const expectedTotal = STAKE_AMOUNT + (STAKE_AMOUNT * BONUS_RATE) / BASIS_POINTS;
      assert.equal(stake[3], expectedTotal);
    });

    it("质押金额为 0 应该失败", async function () {
      const { pool } = await networkHelpers.loadFixture(deployFixture);

      await assert.rejects(
        pool.write.stake([0n], { account: user1.account }),
        /Amount must be > 0/
      );
    });

    it("ID 应该自增", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT * 2n);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });
      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const ids = await pool.read.getUserIds([user1.account.address]);
      assert.equal(ids[0], 8888n);
      assert.equal(ids[1], 8889n);
    });

    it("应该正确记录规则快照", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const stake = await pool.read.stakes([8888n]);
      assert.equal(stake[6], BigInt(LOCK_DURATION));
      assert.equal(stake[7], BigInt(LINEAR_DURATION));
      assert.equal(stake[8], INITIAL_UNLOCK_RATE);
    });
  });

  describe("提现 (claim)", function () {
    it("锁仓期内不能提现", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      // 前进 87 天（还在锁仓期内）
      await networkHelpers.time.increase(87 * DAY);

      await assert.rejects(
        pool.write.claim([8888n], { account: user1.account }),
        /Nothing to claim yet/
      );
    });

    it("锁仓期结束后应该能提取首期解锁部分", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      // 给合约充值足够的代币用于支付奖励
      await token.write.mint([pool.address, STAKE_AMOUNT]);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      // 前进 88 天（刚过锁仓期）
      await networkHelpers.time.increase(LOCK_DURATION);

      const totalReward = STAKE_AMOUNT + (STAKE_AMOUNT * BONUS_RATE) / BASIS_POINTS;
      const expectedInitial = (totalReward * INITIAL_UNLOCK_RATE) / BASIS_POINTS;

      const pendingBefore = await pool.read.getPendingAmount([8888n]);
      // 允许少量误差（因为 time.increase 可能有 1 秒偏差导致线性释放部分）
      const tolerance = parseEther("0.1");
      assert.ok(pendingBefore >= expectedInitial && pendingBefore <= expectedInitial + tolerance);

      await pool.write.claim([8888n], { account: user1.account });

      const stake = await pool.read.stakes([8888n]);
      assert.ok(stake[5] >= expectedInitial && stake[5] <= expectedInitial + tolerance);
    });

    it("线性释放期间应该按比例释放", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      await token.write.mint([pool.address, STAKE_AMOUNT]);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const totalReward = STAKE_AMOUNT + (STAKE_AMOUNT * BONUS_RATE) / BASIS_POINTS;
      const initial = (totalReward * INITIAL_UNLOCK_RATE) / BASIS_POINTS;
      const remaining = totalReward - initial;

      // 前进到锁仓期结束 + 135天（线性释放期一半）
      await networkHelpers.time.increase(LOCK_DURATION + 135 * DAY);

      const pending = await pool.read.getPendingAmount([8888n]);
      const expectedLinear = (remaining * BigInt(135 * DAY)) / BigInt(LINEAR_DURATION);
      const expected = initial + expectedLinear;

      // 允许少量误差（因为时间增加可能有 1 秒偏差）
      const tolerance = parseEther("0.1");
      assert.ok(pending >= expected - tolerance && pending <= expected + tolerance);
    });

    it("线性释放期结束后应该能提取全部", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      await token.write.mint([pool.address, STAKE_AMOUNT]);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const totalReward = STAKE_AMOUNT + (STAKE_AMOUNT * BONUS_RATE) / BASIS_POINTS;

      // 前进到完全释放（88 + 270 天）
      await networkHelpers.time.increase(LOCK_DURATION + LINEAR_DURATION);

      const pending = await pool.read.getPendingAmount([8888n]);
      assert.equal(pending, totalReward);
    });

    it("非订单所有者不能提现", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      await networkHelpers.time.increase(LOCK_DURATION);

      await assert.rejects(
        pool.write.claim([8888n], { account: user2.account }),
        /Not owner/
      );
    });

    it("多次提现应该正确累计", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      await token.write.mint([pool.address, STAKE_AMOUNT]);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      // 第一次提现：锁仓期结束
      await networkHelpers.time.increase(LOCK_DURATION);
      await pool.write.claim([8888n], { account: user1.account });

      const stake1 = await pool.read.stakes([8888n]);
      const claimed1 = stake1[5];

      // 第二次提现：再过 135 天
      await networkHelpers.time.increase(135 * DAY);
      await pool.write.claim([8888n], { account: user1.account });

      const stake2 = await pool.read.stakes([8888n]);
      const claimed2 = stake2[5];

      assert.ok(claimed2 > claimed1);
    });
  });

  describe("管理员功能", function () {
    describe("adminStakeForUser", function () {
      it("管理员应该能为用户创建质押记录", async function () {
        const { token, pool } = await networkHelpers.loadFixture(deployFixture);
        await token.write.mint([pool.address, STAKE_AMOUNT * 2n]);

        await pool.write.adminStakeForUser([user1.account.address, STAKE_AMOUNT]);

        const stake = await pool.read.stakes([8888n]);
        assert.equal(getAddress(stake[1]), getAddress(user1.account.address));
        assert.equal(stake[2], STAKE_AMOUNT);
      });

      it("非管理员不能调用", async function () {
        const { pool } = await networkHelpers.loadFixture(deployFixture);

        await assert.rejects(
          pool.write.adminStakeForUser([user1.account.address, STAKE_AMOUNT], {
            account: user1.account,
          }),
          /OwnableUnauthorizedAccount/
        );
      });
    });

    describe("updateConfig", function () {
      it("管理员应该能更新配置", async function () {
        const { pool } = await networkHelpers.loadFixture(deployFixture);

        await pool.write.updateConfig([8000n, 100n, 300n]);

        assert.equal(await pool.read.bonusRate(), 8000n);
        assert.equal(await pool.read.lockDuration(), BigInt(100 * DAY));
        assert.equal(await pool.read.linearDuration(), BigInt(300 * DAY));
      });

      it("非管理员不能更新配置", async function () {
        const { pool } = await networkHelpers.loadFixture(deployFixture);

        await assert.rejects(
          pool.write.updateConfig([8000n, 100n, 300n], { account: user1.account }),
          /OwnableUnauthorizedAccount/
        );
      });

      it("新配置不应影响已有质押记录", async function () {
        const { token, pool } = await networkHelpers.loadFixture(deployFixture);
        await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);

        await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

        await pool.write.updateConfig([8000n, 100n, 300n]);

        const stake = await pool.read.stakes([8888n]);
        assert.equal(stake[6], BigInt(LOCK_DURATION));
        assert.equal(stake[7], BigInt(LINEAR_DURATION));
      });
    });

    describe("emergencyWithdraw", function () {
      it("管理员应该能紧急提币", async function () {
        const { token, pool } = await networkHelpers.loadFixture(deployFixture);
        await token.write.mint([pool.address, STAKE_AMOUNT]);

        const balanceBefore = (await token.read.balanceOf([owner.account.address])) as bigint;
        await pool.write.emergencyWithdraw([token.address, STAKE_AMOUNT]);
        const balanceAfter = (await token.read.balanceOf([owner.account.address])) as bigint;

        assert.equal(balanceAfter - balanceBefore, STAKE_AMOUNT);
      });

      it("非管理员不能紧急提币", async function () {
        const { token, pool } = await networkHelpers.loadFixture(deployFixture);

        await assert.rejects(
          pool.write.emergencyWithdraw([token.address, STAKE_AMOUNT], {
            account: user1.account,
          }),
          /OwnableUnauthorizedAccount/
        );
      });
    });
  });

  describe("查询接口", function () {
    it("getPendingAmount 应该返回正确的待提现金额", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT);
      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const pending1 = await pool.read.getPendingAmount([8888n]);
      assert.equal(pending1, 0n);

      await networkHelpers.time.increase(LOCK_DURATION);
      const pending2 = await pool.read.getPendingAmount([8888n]);
      const totalReward = STAKE_AMOUNT + (STAKE_AMOUNT * BONUS_RATE) / BASIS_POINTS;
      const expectedInitial = (totalReward * INITIAL_UNLOCK_RATE) / BASIS_POINTS;
      assert.equal(pending2, expectedInitial);
    });

    it("getUserIds 应该返回用户所有订单 ID", async function () {
      const { token, pool } = await networkHelpers.loadFixture(deployFixture);
      await setupUserStake(token, pool, user1.account.address, user1.account, STAKE_AMOUNT * 3n);

      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });
      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });
      await pool.write.stake([STAKE_AMOUNT], { account: user1.account });

      const ids = await pool.read.getUserIds([user1.account.address]);
      assert.equal(ids.length, 3);
      assert.equal(ids[0], 8888n);
      assert.equal(ids[1], 8889n);
      assert.equal(ids[2], 8890n);
    });
  });
});
