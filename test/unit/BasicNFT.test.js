const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

const { developmentChains } = require("../../helper-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("\x1b[35mBasicNFT -- Unit Testing\x1b[0m", () => {
          let BasicNFT, deployer;
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              const { fixture } = deployments;
              await fixture(["all"]);

              BasicNFT = await ethers.getContract("BasicNFT", deployer);
          });

          describe("\x1b[30mconstructor\x1b[0m", () => {
              it("\x1b[34mShould set Token Counter to 0 initially!", async () => {
                  const tokenCounter = await BasicNFT.getCurrentToken();

                  assert.equal(tokenCounter.toString(), "0");
              });

              it("\x1b[34mShould have a Dog TokenURI initially!", async () => {
                  const dogTokenURI = await BasicNFT.tokenURI("0");

                  console.log("\x1b[32m%s\x1b[0m", `DOG URI: ${dogTokenURI}`);

                  expect(dogTokenURI.length).greaterThan(0);
              });
          });

          describe("\x1b[30mmintNFT\x1b[0m", () => {
              it("\x1b[34mShould emit an Event named \x1b[36m'NFTMinted' \x1b[34mon successful Minting!\x1b[0m", async () => {
                  await expect(BasicNFT.mintNFT()).to.emit(BasicNFT, "NFTMinted");
              });

              it("\x1b[34mShould Update Token Counter/Id on Successful Minting!", async () => {
                  const currentTokenId = await BasicNFT.getCurrentToken();

                  const txResponse = await BasicNFT.mintNFT();
                  await txResponse.wait(1);

                  const updatedTokenId = await BasicNFT.getCurrentToken();

                  expect(+updatedTokenId.toString()).greaterThan(+currentTokenId.toString());
              });

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

                      const txResponse = await BasicNFT.mintNFT();
                      await txResponse.wait(1);
                      console.log("\x1b[33m%s\x1b[0", "Waitng for NFT to be Minted...");
                  });
              });
          });
      });
