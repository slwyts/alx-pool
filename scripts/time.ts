async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.log("Usage: npm run time <duration>");
    console.log("Examples:");
    console.log("  npm run time 1     # 快进 1 天 (默认)");
    console.log("  npm run time 7     # 快进 7 天");
    console.log("  npm run time 1d    # 快进 1 天");
    console.log("  npm run time 1h    # 快进 1 小时");
    console.log("  npm run time 30m   # 快进 30 分钟");
    console.log("  npm run time 3600s # 快进 3600 秒");
    process.exit(1);
  }

  // 解析时间
  let seconds: number;
  const match = arg.match(/^(\d+)(d|h|m|s)?$/i);

  if (!match) {
    console.error("Invalid format. Use: 1, 1d, 1h, 30m, 3600s, etc.");
    process.exit(1);
  }

  const value = parseInt(match[1]);
  const unit = (match[2] || "d").toLowerCase(); // 默认为天

  switch (unit) {
    case "d":
      seconds = value * 86400;
      break;
    case "h":
      seconds = value * 3600;
      break;
    case "m":
      seconds = value * 60;
      break;
    case "s":
      seconds = value;
      break;
    default:
      seconds = value * 86400;
      break;
  }

  const displayUnit = unit === "d" ? "天" : unit === "h" ? "小时" : unit === "m" ? "分钟" : "秒";
  console.log(`快进 ${value} ${displayUnit} (${seconds} 秒)...`);

  // 直接通过 RPC 调用
  const rpcUrl = "http://127.0.0.1:8545";

  // 获取当前区块时间
  const blockResponse = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: ["latest", false],
      id: 1,
    }),
  });
  const blockData = await blockResponse.json();
  const beforeTimestamp = parseInt(blockData.result.timestamp, 16);
  console.log(`Before: ${new Date(beforeTimestamp * 1000).toLocaleString()}`);

  // 快进时间
  await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: 2,
    }),
  });

  // 挖一个新块使时间生效
  await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: 3,
    }),
  });

  // 获取新的区块时间
  const newBlockResponse = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: ["latest", false],
      id: 4,
    }),
  });
  const newBlockData = await newBlockResponse.json();
  const afterTimestamp = parseInt(newBlockData.result.timestamp, 16);
  console.log(`After:  ${new Date(afterTimestamp * 1000).toLocaleString()}`);

  console.log(`\n时间已快进 ${value} ${displayUnit}!`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
