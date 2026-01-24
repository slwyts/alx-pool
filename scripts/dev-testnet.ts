import { spawn, execSync, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "hardhat-node.log");
const isWindows = process.platform === "win32";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForNode(maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch("http://127.0.0.1:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });
      if (response.ok) {
        console.log("Hardhat node is ready!");
        return true;
      }
    } catch {
      // Node not ready yet
    }
    console.log(`Waiting for hardhat node... (${i + 1}/${maxAttempts})`);
    await sleep(1000);
  }
  return false;
}

async function main() {
  console.log("========================================");
  console.log("ALX Pool Development Environment");
  console.log("========================================\n");

  // 1. Start hardhat node in background
  console.log("1. Starting Hardhat node in background...");
  console.log(`   Log file: ${LOG_FILE}`);

  const logStream = fs.openSync(LOG_FILE, "w");

  let hardhatProcess: ChildProcess;
  if (isWindows) {
    hardhatProcess = spawn("npx", ["hardhat", "node"], {
      detached: true,
      stdio: ["ignore", logStream, logStream],
      shell: true,
    });
  } else {
    hardhatProcess = spawn("npx", ["hardhat", "node"], {
      detached: true,
      stdio: ["ignore", logStream, logStream],
    });
  }

  hardhatProcess.unref();
  console.log(`   Hardhat node PID: ${hardhatProcess.pid}`);

  // Save PID for cleanup
  fs.writeFileSync(
    path.join(process.cwd(), ".hardhat-pid"),
    String(hardhatProcess.pid)
  );

  // 2. Wait for node to be ready
  console.log("\n2. Waiting for Hardhat node to start...");
  const nodeReady = await waitForNode();

  if (!nodeReady) {
    console.error("Failed to start Hardhat node!");
    process.exit(1);
  }

  // 3. Compile contracts
  console.log("\n3. Compiling contracts...");
  execSync("npx hardhat compile", { stdio: "inherit" });

  // 4. Deploy contracts
  console.log("\n4. Deploying contracts...");
  execSync("npx hardhat run scripts/deploy-local.ts --network localhost", {
    stdio: "inherit",
  });

  // 5. Start Next.js dev server
  console.log("\n5. Starting Next.js dev server...");
  console.log("========================================\n");

  const nextProcess = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: isWindows,
  });

  // Handle cleanup on exit
  const cleanup = () => {
    console.log("\nShutting down...");
    try {
      const pid = fs.readFileSync(
        path.join(process.cwd(), ".hardhat-pid"),
        "utf-8"
      );
      if (isWindows) {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
      } else {
        process.kill(-parseInt(pid));
      }
      fs.unlinkSync(path.join(process.cwd(), ".hardhat-pid"));
    } catch {
      // Process may already be dead
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  nextProcess.on("close", cleanup);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
