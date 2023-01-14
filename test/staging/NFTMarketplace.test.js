const { ethers } = require("hardhat");

const { developmentChains } = require("../../helper-config");

!!developmentChains.includes(network.name)
    ? describe.skip
    : describe("\x1b[35mNFTMarketplace -- Staging Testing\x1b[0m", () => {
          let BasicNFT, NFTMarketplace, deployer, tokenId;
          const nftPrice = ethers.utils.parseEther("0.01");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;

              BasicNFT = await ethers.getContract("BasicNFT", deployer);
              NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);

              const txResponse = await BasicNFT.mintNFT();
              const txReceipt = await txResponse.wait(1);

              tokenId = txReceipt.events[0].args.tokenId.toString();

              const approveTxResponse = await BasicNFT.approve(NFTMarketplace.address, tokenId);
              await approveTxResponse.wait(1);
          });

          it("\x1b[34mShould List an NFT, update NFT, and cancel the NFT!", async () => {
              console.log("\x1b[33m%s\x1b[0m", "Waiting for NFT to be listed...");
              const listNFTTxResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
              await listNFTTxResponse.wait(1);
              console.log("\x1b[32m%s\x1b[0m", "NFT listed!");
              console.log("");

              console.log("\x1b[33m%s\x1b[0m", "Waiting for NFT to be Updated...");
              const updateNFTTxResponse = await NFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                  value: ethers.utils.parseEther("0.02").toString(),
              });

              await updateNFTTxResponse.wait(1);
              console.log("\x1b[32m%s\x1b[0m", "NFT Updated!");
              console.log("");

              console.log("\x1b[33m%s\x1b[0m", "Waiting for Proceeds to be Canceled...");
              const cancelNFTTxResponse = await NFTMarketplace.cancelItem(BasicNFT.address, tokenId);
              await cancelNFTTxResponse.wait(1);
              console.log("\x1b[32m%s\x1b[0m", "Proceeds canceled!");
              console.log("");
          });
      });
