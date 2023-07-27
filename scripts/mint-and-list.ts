import { deployments, ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";

const PRICE = ethers.parseEther('0.1');

async function mintAdnList() {
  const nftMarketplaceAddres = (await deployments.get("NftMarketplace")).address;
  const nftMarketplace = await ethers.getContractAt("NftMarketplace", nftMarketplaceAddres);
  const basicNftAddress = (await deployments.get("BasicNft")).address;
  const basicNft = await ethers.getContractAt("BasicNft", basicNftAddress);

  console.log('Minting NFT...');
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId: bigint = mintTxReceipt?.logs?.[0]?.args?.[2];
  console.log('tokenId', tokenId);

  console.log('Approving NFT...');
  const approvalTxn = await basicNft.approve(nftMarketplaceAddres, tokenId);
  await approvalTxn.wait(1);

  console.log('Listing NFT...');
  const tx = await nftMarketplace.listItem(basicNftAddress, tokenId, PRICE);
  await tx.wait(1);
  console.log('NFT listed!')

  if (network.config.chainId === 31337) {
    await moveBlocks(1, 1000);
  }
}

mintAdnList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
