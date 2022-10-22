import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { DEPLOY_DISTRIBUTOR } from "./task-names";

import { log } from "../helpers/log";
import { Distributor__factory } from "../typechain-types";

task(DEPLOY_DISTRIBUTOR).setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const [signer] = await hre.ethers.getSigners();
    log.preDeploy("Distributor");

    const factory = new Distributor__factory(signer);
    const distributor = await factory.deploy();
    await distributor.deployed();
    log.deploy("Distributor", distributor.address);
  }
);
