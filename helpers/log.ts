import type { LogType } from "./types";

const prettyDeploy = (contractName: string, conrtactAddress: string) => {
  console.log(
    `🌐 \x1b[34m${contractName}\x1b[0m deployed. Address: \x1b[36m${conrtactAddress}\x1b[0m`
  );
};

const prettyPreDeploy = (contractName: string) => {
  console.log(`⌛ Deploying \x1b[34m${contractName}...`);
};

export const log: LogType = {
  deploy: prettyDeploy,
  preDeploy: prettyPreDeploy,
};
