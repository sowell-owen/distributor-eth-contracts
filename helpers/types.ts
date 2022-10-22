export type LogType = {
  deploy: (contractName: string, conrtactAddress: string) => void;
  preDeploy: (contractName: string) => void;
};
