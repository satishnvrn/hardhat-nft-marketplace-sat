import { ethers } from 'hardhat';

export interface networkConfigItem {
  name?: string;
  blockConfirmations?: number;
  interval?: string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  11155111: {
    name: 'sepolia',
    blockConfirmations: 6,
    interval: "30"
  },
  31337: {
    name: 'hardhat',
    interval: "30"
  },
};

export const developmentChains: string[] = ['hardhat', 'localhost'];
export const BASE_FEE = ethers.parseEther('0.25');
export const GAS_PRICE_LINK = 1e9;
export const INITIAL_SUPPLY = "1000000000000000000000000";
