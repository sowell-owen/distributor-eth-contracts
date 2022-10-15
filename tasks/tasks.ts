import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { DEPLOY_LOCK } from "./task-names";
import { preAction } from "./utils";

import { Lock__factory } from "../typechain-types";

task(DEPLOY_LOCK)
  .addParam("unlockTime", "Tokens unlock time", 0, types.int)
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await preAction(hre);
    const [signer] = await hre.ethers.getSigners();

    const factory = new Lock__factory(signer);
    const lock = await factory.deploy(params.unlockTime);
    await lock.deployed();
  });
