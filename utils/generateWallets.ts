import type { Wallet } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { ADDRESSES_AMOUNT } from "./constants";

export const generateWallets = (hre: HardhatRuntimeEnvironment): Wallet[] => {
  const wallets: Wallet[] = [];
  for (let i = 0; i <= ADDRESSES_AMOUNT; i++) {
    const wallet = hre.ethers.Wallet.createRandom().connect(
      hre.ethers.provider
    );
    wallets.push(wallet);
  }
  return wallets;
};
