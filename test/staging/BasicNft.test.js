const { network, getNamedAccounts, ethers } = require("hardhat");
const { assert } = require("chai");

const { developmentChains } = require("../../helper-config");

!!developmentChains.includes(network.name)
    ? describe.skip
    : describe("\x1b[35mBasicNFT -- Staging Testing\x1b[0m", () => {
          let BasicNFT, deployer;
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;

              BasicNFT = await ethers.getContract("BasicNFT", deployer);
          });

          describe("\x1b[30mmintNFT\x1b[0m", () => {
              it("\x1b[34mShould emit and listen an Event named \x1b[36m'NFTMinted' \x1b[34mon successful Minting!\x1b[0m", async () => {
                  await new Promise(async (resolve, reject) => {
                      BasicNFT.once("NFTMinted", async (nftOwner) => {
                          try {
                              console.log("\x1b[32m%s\x1b[0m", `NFT OWNER: ${nftOwner}`);
                              assert.equal(nftOwner, deployer);
                              resolve();
                          } catch (e) {
                              console.log("\x1b[31m%s\x1b[0m", `BasicNFT.test.js -- unit -- ERROR: ${e}`);
                              reject(e);
                          }
                      });

                      await BasicNFT.mintNFT();
                      console.log("\x1b[33m%s\x1b[0", "Waitng for NFT to be Minted...");
                  });
              });
          });
      });
