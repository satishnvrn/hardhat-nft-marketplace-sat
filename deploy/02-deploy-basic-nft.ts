import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployBasicNft: DeployFunction = async ({
  getNamedAccounts,
  deployments: { deploy },
  network,
}: HardhatRuntimeEnvironment) => {
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId || 0;

  const args: string[] = [];
  const basicNft = await deploy("BasicNft", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig?.[chainId]?.blockConfirmations || 1,
  });
  console.log("basic nft deployed...");

  if (!developmentChains.includes(network.name)) {
    console.log("verifying basic nft...")
    await verify(basicNft.address, args);
  }
};

export default deployBasicNft;
deployBasicNft.tags = ["all", "nftMarketplace"];
