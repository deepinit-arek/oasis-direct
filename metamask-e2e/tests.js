import Web3 from "web3";
import PrivateKeyProvider from "truffle-privatekey-provider";
const Puppeteer = require("puppeteer");
const { launchPuppeteerWithMetamask, setupMetamask } = require("metamask-puppeteer");
const { click, waitForText } = require("puppeteer-better-utils");

const { tid, restoreBlockchain, lastSnapshotId, ACCOUNT_3_PRIV } = require("../cypress/utils/");

const IS_DEV = process.env.DEV === "1";
const ETH_PROVIDER = process.env.ETH_PROVIDER;
console.assert(ETH_PROVIDER, "Missing ETH_PROVIDER env");

async function main() {
  const provider = new PrivateKeyProvider(ACCOUNT_3_PRIV.replace("0x", ""), ETH_PROVIDER);
  const web3 = new Web3(provider);
  await restoreBlockchain(web3)(lastSnapshotId);

  console.log("Starting browser...");
  const browser = await launchPuppeteerWithMetamask(Puppeteer, {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  console.log("Browser started");
  const metamaskController = await setupMetamask(browser);

  const oasisPage = await browser.newPage();
  await oasisPage.goto("http://localhost:3000");

  await metamaskController.loadPrivateKey("0x1ff8271bf14ac9bef0b641cced40dc2a7ebd2e37d8e16d25b4aa1911364219af");
  await metamaskController.changeNetwork("localhost");

  await click(oasisPage, tid("wallets-continue"));

  await metamaskController.allowToConnect();

  await waitForText(oasisPage, tid("set-trade-from", tid("token-amount-value")), /8,999.... ETH/);
  await waitForText(oasisPage, tid("set-trade-to", tid("token-amount-value")), /170 DAI/);

  console.log("Done!");

  // don't close window to early in dev mode
  if (!IS_DEV) {
    await oasisPage.close();
    await browser.close();
  }
}

main().catch(e => {
  console.error(e);
  // don't close window to early in dev mode
  if (!IS_DEV) {
    process.exit(1);
  }
});
