import { expect } from "chai";
import type { Signer, Wallet } from "ethers";
import { BigNumber } from "ethers";
import hre from "hardhat";

import type { Distributor, ERC20 } from "../typechain-types";
import { Distributor__factory, TestToken__factory } from "../typechain-types";
import { ETH_BALANCE } from "../utils/constants";
import { generateWallets } from "../utils/generateWallets";
import { setBalanceHre } from "../utils/setBalance";

describe("Distributor test scope", () => {
  let signer: Signer;
  let otherSigner: Signer;
  let erc20: ERC20;
  let distributor: Distributor;
  let wallets: Wallet[];
  let addresses: string[];
  let amounts: BigNumber[];
  let sumOfAmounts: BigNumber = BigNumber.from("0");

  beforeEach(async () => {
    [signer, otherSigner] = await hre.ethers.getSigners();
    erc20 = await new TestToken__factory(signer).deploy();
    await erc20.deployed();

    distributor = await new Distributor__factory(signer).deploy();
    await distributor.deployed();

    wallets = generateWallets(hre);
    addresses = wallets.map((wallet) => wallet.address);

    amounts = wallets.map(() => {
      let amount: number | BigNumber = Math.random() * 5 + 1;
      amount = hre.ethers.utils.parseEther(amount.toString());
      sumOfAmounts = sumOfAmounts.add(amount);
      return amount;
    });

    await Promise.all(
      wallets.map(async (wallet) => {
        await setBalanceHre(
          hre,
          wallet.address,
          hre.ethers.utils.hexValue(ETH_BALANCE)
        );
      })
    );
  });

  it("Should distribute ETH to recipients", async () => {
    await setBalanceHre(
      hre,
      distributor.address,
      hre.ethers.utils.hexValue(sumOfAmounts)
    );

    const distributorContract = distributor.connect(signer);
    const sendETH = await distributorContract.distributeEther(
      addresses,
      amounts
    );
    await sendETH.wait();

    wallets.map(async (wallet, i) => {
      const defaultBalance = BigNumber.from(ETH_BALANCE.toString());
      const balance = await wallet.getBalance();
      expect(balance).to.eq(defaultBalance.add(amounts[i]));
    });

    const contractBalance = await hre.ethers.provider.getBalance(
      distributor.address
    );
    expect(contractBalance).to.eq(BigNumber.from("0"));
  });

  it("Should distribute equal amount of ETH to recipients", async () => {
    const amountToSend = amounts[0];
    await setBalanceHre(
      hre,
      distributor.address,
      hre.ethers.utils.hexValue(amountToSend.mul(addresses.length))
    );

    const distributorContract = distributor.connect(signer);
    const sendETH = await distributorContract.distributeEtherEqualAmount(
      addresses,
      amountToSend
    );
    await sendETH.wait();

    wallets.map(async (wallet) => {
      const defaultBalance = BigNumber.from(ETH_BALANCE.toString());
      const balance = await wallet.getBalance();
      expect(balance).to.eq(defaultBalance.add(amountToSend));
    });

    const contractBalance = await hre.ethers.provider.getBalance(
      distributor.address
    );
    expect(contractBalance).to.eq(BigNumber.from("0"));
  });

  it("Should distribute ERC20 to recipients", async () => {
    const fundWallet = await erc20.transfer(
      await signer.getAddress(),
      sumOfAmounts
    );
    await fundWallet.wait();

    const approve = await erc20.approve(distributor.address, sumOfAmounts);
    await approve.wait();

    const distributorContract = distributor.connect(signer);
    const sendERC20 = await distributorContract.distributeERC20(
      erc20.address,
      addresses,
      amounts
    );
    await sendERC20.wait();

    addresses.map(async (address, i) => {
      const balance = await erc20.balanceOf(address);
      expect(balance).to.eq(amounts[i]);
    });
    const contractBalance = await erc20.balanceOf(distributor.address);
    expect(contractBalance).to.eq(BigNumber.from("0"));
  });

  it("Should distribute equal amount of ERC20 to recipients", async () => {
    const amountToSend = amounts[0];
    const totalAmountToSend = amountToSend.mul(addresses.length);

    const fundWallet = await erc20.transfer(
      await signer.getAddress(),
      totalAmountToSend
    );
    await fundWallet.wait();

    const approve = await erc20.approve(distributor.address, totalAmountToSend);
    await approve.wait();

    const distributorContract = distributor.connect(signer);
    const sendERC20 = await distributorContract.distributeERC20EqualAmount(
      erc20.address,
      addresses,
      amountToSend
    );
    await sendERC20.wait();

    addresses.map(async (address) => {
      const balance = await erc20.balanceOf(address);
      expect(balance).to.eq(amountToSend);
    });

    const contractBalance = await erc20.balanceOf(distributor.address);
    expect(contractBalance).to.eq(BigNumber.from("0"));
  });

  it("Should not be able to perform transactions", async () => {
    const distributorContract = distributor.connect(otherSigner);

    const approve = await erc20.approve(
      distributorContract.address,
      sumOfAmounts.mul(3)
    );
    await approve.wait();

    const sendETH = distributorContract.distributeEther(addresses, amounts);
    const sendETHEqualAmount = distributorContract.distributeEtherEqualAmount(
      addresses,
      amounts[0]
    );

    const sendERC20 = distributorContract.distributeERC20(
      erc20.address,
      addresses,
      amounts
    );
    const sendERC20EqualAmount = distributorContract.distributeERC20EqualAmount(
      erc20.address,
      addresses,
      amounts[0]
    );

    await expect(sendETH).to.be.reverted;
    await expect(sendETHEqualAmount).to.be.reverted;
    await expect(sendERC20).to.be.reverted;
    await expect(sendERC20EqualAmount).to.be.reverted;
  });
});
