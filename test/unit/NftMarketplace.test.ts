import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { NftMarketPlace } from "../../typechain-types/contracts/NftMarketplace.sol";
import { BasicNft } from "../../typechain-types";
import { ContractRunner } from "ethers";
import { assert } from "chai";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NftMarketplace", async () => {
      let nftMarketplace: NftMarketPlace,
        basicNft: BasicNft,
        nftMarketplaceAddress: string,
        basicNftAddress: string,
        deployer: HardhatEthersSigner,
        player: HardhatEthersSigner;
      const PRICE = ethers.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        const deploymentResults = await deployments.fixture(["all"]);

        nftMarketplaceAddress =
          deploymentResults?.["NftMarketplace"]?.address || "";
        nftMarketplace = await ethers.getContractAt(
          "NftMarketplace",
          nftMarketplaceAddress
        );

        basicNftAddress = deploymentResults?.["BasicNft"]?.address || "";
        basicNft = await ethers.getContractAt("BasicNft", basicNftAddress);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplaceAddress, TOKEN_ID);
      });

      it("lists and can be bought", async () => {
        await nftMarketplace.listItem(basicNftAddress, TOKEN_ID, PRICE);
        const playerConnectedNftMarketplace = nftMarketplace.connect(player);
        await playerConnectedNftMarketplace.buyItem(basicNftAddress, TOKEN_ID, {
          value: PRICE,
        });
        const newOwner = await basicNft.ownerOf(TOKEN_ID);
        const deployerProceeds = await nftMarketplace.getProceeds(deployer);
        assert.equal(newOwner.toString(), player.address);
        assert.equal(deployerProceeds.toString(), PRICE.toString());
      });

      it("it can be listed and cancelled", async () => {
        await nftMarketplace.listItem(basicNftAddress, TOKEN_ID, PRICE);
        await nftMarketplace.cancelListing(basicNftAddress, TOKEN_ID);
        const listing = await nftMarketplace.getListing(
          basicNftAddress,
          TOKEN_ID
        );
        assert.equal(listing.price.toString(), "0");
      });

      it("updating the listing", async () => {
        const newPrice = ethers.parseEther("0.2");
        await nftMarketplace.listItem(basicNftAddress, TOKEN_ID, PRICE);
        await nftMarketplace.updateListing(basicNftAddress, TOKEN_ID, newPrice);
        const updatedPrice = (
          await nftMarketplace.getListing(basicNftAddress, TOKEN_ID)
        ).price;
        assert.equal(updatedPrice.toString(), newPrice.toString());
      });

      it("it can listitem, sell and withdraw proceeds", async () => {
        await nftMarketplace.listItem(basicNftAddress, TOKEN_ID, PRICE);
        const playerConnectedNftMarketplace = nftMarketplace.connect(player);
        await playerConnectedNftMarketplace.buyItem(basicNftAddress, TOKEN_ID, {
          value: PRICE,
        });

        const deployerProceedsBefore = await nftMarketplace.getProceeds(
          deployer.address
        );
        const deployerBalance = await deployer.provider.getBalance(
          deployer.address
        );
        const txnResponse = await nftMarketplace.withdrawProceeds();
        const txnReceipt = (await txnResponse.wait(1)) || {
          gasUsed: BigInt(0),
          gasPrice: BigInt(0),
        };
        const { gasUsed, gasPrice } = txnReceipt;
        const gasCost = gasUsed * gasPrice;
        const deployerBalanceAfter = await deployer.provider.getBalance(
          deployer.address
        );

        assert.equal(
          (deployerBalanceAfter + gasCost).toString(),
          (deployerProceedsBefore + deployerBalance).toString()
        );
      });
    });
