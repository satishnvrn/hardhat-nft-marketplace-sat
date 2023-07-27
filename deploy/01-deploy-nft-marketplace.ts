import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployNftMarketplace: DeployFunction = async ({
  getNamedAccounts,
  deployments: { deploy },
  network,
}: HardhatRuntimeEnvironment) => {
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId || 0;

  const args: string[] = [];
  const nftMarketplace = await deploy("NftMarketplace", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig?.[chainId]?.blockConfirmations || 1,
  });
  console.log("our marketplace deployed...");

  if (!developmentChains.includes(network.name)) {
    console.log("verifying nft marketplace...");
    await verify(nftMarketplace.address, args);
  }
};

export default deployNftMarketplace;
deployNftMarketplace.tags = ["all", "nftMarketplace"];
