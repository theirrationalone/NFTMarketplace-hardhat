const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

const { developmentChains } = require("../../helper-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("\x1b[35mNFTMarketplace -- Unit Testing\x1b[0m", () => {
          let BasicNFT, deployer, NFTMarketplace, tokenId;
          const nftPrice = ethers.utils.parseEther("0.01");
          let signers;
          beforeEach(async () => {
              signers = await ethers.getSigners();

              deployer = (await getNamedAccounts()).deployer;
              const { fixture } = deployments;
              await fixture(["all"]);

              BasicNFT = await ethers.getContract("BasicNFT", deployer);
              const txResponse = await BasicNFT.mintNFT();
              const txReceipt = await txResponse.wait(1);
              tokenId = txReceipt.events[0].args.tokenId;
              NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);
              await BasicNFT.approve(NFTMarketplace.address, tokenId.toString());
          });

          describe("\x1b[30mlistItem\x1b[0m", () => {
              it("\x1b[34mShould list NFT Successfully!", async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);

                  const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

                  assert.equal(price.toString(), nftPrice.toString());
                  assert.equal(seller, deployer);
              });

              it("\x1b[34mShould not List NFT if Lister is not the owner of NFT and therefore reverted!", async () => {
                  const anotherUserWithNFTMarketplace = await NFTMarketplace.connect(signers[1]);

                  await expect(anotherUserWithNFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString()))
                      .to.be.reverted;
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace___NotOwner' \x1b[34m!\x1b[0m", async () => {
                  const anotherUserWithNFTMarketplace = await NFTMarketplace.connect(signers[1]);
                  await expect(
                      anotherUserWithNFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString())
                  ).to.be.revertedWithCustomError(NFTMarketplace, "NFTMarketplace___NotOwner");
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace___NftAlreadyListed' \x1b[36m!\x1b[0m", async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);

                  await expect(
                      NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString())
                  ).to.be.revertedWithCustomError(NFTMarketplace, "NFTMarketplace___NftAlreadyListed");
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace___NotApprovedForNFTMarketplace' \x1b[36m!\x1b[0m", async () => {
                  const txResponse = await BasicNFT.mintNFT();
                  const txReceipt = await txResponse.wait(1);
                  const newTokenId = txReceipt.events[0].args.tokenId;

                  console.log("\x1b[32m%s\x1b[0m", `New TokenId: ${newTokenId.toString()}`);

                  await expect(
                      NFTMarketplace.listItem(BasicNFT.address, newTokenId, nftPrice.toString())
                  ).to.be.revertedWithCustomError(NFTMarketplace, "NFTMarketplace___NotApprovedForNFTMarketplace");
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace___NftPriceMustBeGreaterThanZero' \x1b[36m!\x1b[0m", async () => {
                  await expect(NFTMarketplace.listItem(BasicNFT.address, tokenId, "0")).to.be.revertedWithCustomError(
                      NFTMarketplace,
                      "NFTMarketplace___NftPriceMustBeGreaterThanZero"
                  );
              });

              it("\x1b[34mShould emit an event named \x1b[36m'ItemListed' \x1b[34mon successful Listing!\x1b[0m", async () => {
                  await expect(NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString())).to.emit(
                      NFTMarketplace,
                      "ItemListed"
                  );
              });

              it("\x1b[34mShould emit and listen an event named \x1b[36m'ItemListed' \x1b[34mon successful Listing!\x1b[0m", async () => {
                  await new Promise(async (resolve, reject) => {
                      NFTMarketplace.once("ItemListed", async (nftAddress, fetchedTokenId, seller, price) => {
                          try {
                              console.log("\x1b[32m%s\x1b[0m", `NFT Address: ${nftAddress}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT TokenId: ${fetchedTokenId.toString()}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT Seller/Owner Address: ${seller}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT Price: ${ethers.utils.formatEther(price)} ETH`);

                              assert.equal(seller, deployer);
                              assert.equal(nftAddress, BasicNFT.address);
                              assert.equal(fetchedTokenId.toString(), tokenId.toString());
                              assert.equal(price.toString(), nftPrice.toString());
                              resolve();
                          } catch (e) {
                              console.log("\x1b[31m%s\x1b[0m", `NFTMarketplace.test.js -- unit -- ERROR: ${e}`);
                              reject(e);
                          }
                      });

                      const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                      await txResponse.wait(1);

                      console.log("\x1b[33m%s\x1b[0m", "Waiting for NFT to be Listed...");
                  });
              });

              it("\x1b[34mShould have proceeds equals to zero on listing nft \x1b[0m", async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);

                  const proceeds = await NFTMarketplace.getProceeds();

                  assert.equal(proceeds.toString(), "0");
              });
          });

          describe("\x1b[30mbuyItem\x1b[0m", () => {
              let anotherUserWithNFTMarketplace;
              beforeEach(async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);

                  anotherUserWithNFTMarketplace = await NFTMarketplace.connect(signers[1]);
              });

              it("\x1b[34mShould buy NFT Successfully!\x1b[0m", async () => {
                  assert(
                      await anotherUserWithNFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                          value: nftPrice.toString(),
                      })
                  );
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace__CannotBuySelfedOwnedNFTs' \x1b[34mif buyer Owns the NFT!\x1b[0m", async () => {
                  await expect(
                      NFTMarketplace.buyItem(BasicNFT.address, tokenId, { value: nftPrice.toString() })
                  ).to.be.revertedWithCustomError(NFTMarketplace, "NFTMarketplace__CannotBuySelfedOwnedNFTs");
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace__notPaidEnoughToBuy' \x1b[34m!\x1b[0m", async () => {
                  await expect(
                      anotherUserWithNFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                          value: nftPrice.sub(ethers.utils.parseEther("0.005")).toString(),
                      })
                  ).to.be.revertedWithCustomError(NFTMarketplace, "NFTMarketplace__notPaidEnoughToBuy");
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace___NftNotListed' \x1b[34m!\x1b[0m", async () => {
                  await expect(
                      anotherUserWithNFTMarketplace.buyItem(signers[3].address, tokenId, {
                          value: nftPrice.toString(),
                      })
                  ).to.be.revertedWithCustomError(NFTMarketplace, "NFTMarketplace___NftNotListed");
              });

              it("\x1b[34mShould update proceeds on successful NFT Purchase!\x1b[0m", async () => {
                  const txResponse = await anotherUserWithNFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                      value: nftPrice.toString(),
                  });

                  await txResponse.wait(1);

                  const proceeds = await NFTMarketplace.getProceeds();

                  assert.equal(proceeds.toString(), nftPrice.toString());
              });

              it("\x1b[34mShould remove NFT listing and transfer NFT to new Owner on successful NFT Purchase!\x1b[0m", async () => {
                  const oldOwnerOfNFT = await BasicNFT.ownerOf(tokenId);
                  const txResponse = await anotherUserWithNFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                      value: nftPrice.toString(),
                  });

                  await txResponse.wait(1);

                  const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

                  const newOwnerOfNFT = await BasicNFT.ownerOf(tokenId);

                  const proceeds = await NFTMarketplace.getProceeds();

                  console.log(
                      "\x1b[32m%s\x1b[0m",
                      `Updated Proceeds: ${ethers.utils.formatEther(proceeds.toString())} ETH`
                  );

                  console.log("\x1b[32m%s\x1b[0m", `Old Owner of NFT: ${oldOwnerOfNFT}`);
                  console.log("\x1b[32m%s\x1b[0m", `New Owner of NFT: ${newOwnerOfNFT}`);
                  console.log("\x1b[32m%s\x1b[0m", `Lising removal Proof - Price: ${price.toString()}`);
                  console.log("\x1b[32m%s\x1b[0m", `Lising removal Proof - Seller: ${seller.toString()}`);

                  assert.equal(proceeds.toString(), nftPrice.toString());
                  assert.equal(newOwnerOfNFT, signers[1].address);
                  assert.equal(oldOwnerOfNFT, deployer);
                  assert.notEqual(newOwnerOfNFT, deployer);
                  assert.notEqual(oldOwnerOfNFT, signers[1].address);
                  assert.equal(price.toString(), "0");
                  assert.equal(seller.toString(), "0x0000000000000000000000000000000000000000");
              });

              it("\x1b[34mShould emit and listen an event named \x1b[36m'ItemBought' \x1b[34mon successful NFT Purchasing!\x1b[0m", async () => {
                  await new Promise(async (resolve, reject) => {
                      NFTMarketplace.once("ItemBought", async (nftAddress, fetchedTokenId, buyer, price) => {
                          try {
                              console.log("\x1b[32m%s\x1b[0m", `NFT Address: ${nftAddress}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT TokenId: ${fetchedTokenId.toString()}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT Buyer/New Owner Address: ${buyer}`);
                              console.log(
                                  "\x1b[32m%s\x1b[0m",
                                  `NFT Purchaser/New Owner Address: ${await BasicNFT.ownerOf(
                                      fetchedTokenId.toString()
                                  )}`
                              );
                              console.log("\x1b[32m%s\x1b[0m", `NFT Price: ${ethers.utils.formatEther(price)} ETH`);

                              assert.equal(buyer, signers[1].address);
                              assert.equal(nftAddress, BasicNFT.address);
                              assert.equal(fetchedTokenId.toString(), tokenId.toString());
                              assert.equal(price.toString(), nftPrice.toString());
                              resolve();
                          } catch (e) {
                              console.log("\x1b[31m%s\x1b[0m", `NFTMarketplace.test.js -- unit -- ERROR: ${e}`);
                              reject(e);
                          }
                      });

                      const txResponse = await anotherUserWithNFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                          value: nftPrice.toString(),
                      });

                      await txResponse.wait(1);
                      console.log("\x1b[33m%s\x1b[0m", "Waiting for NFT to be Purchased...");
                  });
              });
          });

          describe("\x1b[30mcancelItem\x1b[0m", () => {
              beforeEach(async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);
              });

              it("\x1b[34mShould cancel Listing of the NFT successfully!\x1b[0m", async () => {
                  const { price: priceBeforeCancel, seller: sellerBeforeCancel } = await NFTMarketplace.getListings(
                      BasicNFT.address,
                      tokenId
                  );

                  console.log(
                      "\x1b[32m%s\x1b[0m",
                      `Lising before cancellation - Price: ${priceBeforeCancel.toString()}`
                  );
                  console.log(
                      "\x1b[32m%s\x1b[0m",
                      `Lising before cancellation - Seller: ${sellerBeforeCancel.toString()}`
                  );

                  const txResponse = await NFTMarketplace.cancelItem(BasicNFT.address, tokenId);
                  await txResponse.wait(1);

                  const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

                  console.log("\x1b[32m%s\x1b[0m", `Lising after cancellation - Price: ${price.toString()}`);
                  console.log("\x1b[32m%s\x1b[0m", `Lising after cancellation - Seller: ${seller.toString()}`);

                  assert.equal(priceBeforeCancel.toString(), nftPrice.toString());
                  assert.equal(sellerBeforeCancel, deployer);
                  assert.equal(price.toString(), "0");
                  assert.equal(seller.toString(), "0x0000000000000000000000000000000000000000");
              });

              it("\x1b[34mShould emit and listen an event named \x1b[36m''ItemCanceled' \x1b[34mon successful NFT Listing cancellation!\x1b[0m", async () => {
                  await new Promise(async (resolve, reject) => {
                      NFTMarketplace.once("ItemCanceled", async (nftAddress, fetchedTokenId) => {
                          try {
                              const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

                              console.log(
                                  "\x1b[32m%s\x1b[0m",
                                  `Lising after cancellation - Price: ${price.toString()}`
                              );
                              console.log(
                                  "\x1b[32m%s\x1b[0m",
                                  `Lising after cancellation - Seller: ${seller.toString()}`
                              );

                              assert.equal(nftAddress, BasicNFT.address);
                              assert.equal(fetchedTokenId.toString(), tokenId);
                              assert.equal(price.toString(), "0");
                              assert.equal(seller.toString(), "0x0000000000000000000000000000000000000000");
                              resolve();
                          } catch (e) {
                              console.log("\x1b[31m%s\x1b[0m", `NFTMarketplace.test.js -- unit -- ERROR: ${e}`);
                              reject(e);
                          }
                      });

                      const txResponse = await NFTMarketplace.cancelItem(BasicNFT.address, tokenId);
                      await txResponse.wait(1);

                      console.log("\x1b[33m%s\x1b[0m", "Waiting for NFT to be Canceled...");
                  });
              });
          });

          describe("\x1b[30mupdateItem\x1b[0m", () => {
              let newNftPrice = ethers.utils.parseEther("0.05");
              beforeEach(async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);
              });

              it("\x1b[34mShould Update NFT successfully!\x1b[0m", async () => {
                  const { price: oldPrice } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

                  const txResponse = await NFTMarketplace.updateItem(BasicNFT.address, tokenId, newNftPrice.toString());
                  await txResponse.wait(1);

                  const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

                  console.log("\x1b[32m%s\x1b[0m", `Old Price: ${ethers.utils.formatEther(oldPrice.toString())} ETH`);
                  console.log("\x1b[32m%s\x1b[0m", `New Price: ${ethers.utils.formatEther(price.toString())} ETH`);

                  assert.equal(seller, deployer);
                  assert.equal(oldPrice.toString(), nftPrice.toString());
                  assert.equal(price.toString(), newNftPrice.toString());
              });

              it("\x1b[34mShould be reverted with msg 'NFTMarketplace___NftPriceMustBeGreaterThanZero' \x1b[34m!\x1b[0m", async () => {
                  await expect(NFTMarketplace.updateItem(BasicNFT.address, tokenId, "0")).to.be.revertedWithCustomError(
                      NFTMarketplace,
                      "NFTMarketplace___NftPriceMustBeGreaterThanZero"
                  );
              });

              it("\x1b[34mShould emit and listen an event named \x1b[36m'ItemUpdated' \x1b[34mon successful Listing!\x1b[0m", async () => {
                  await new Promise(async (resolve, reject) => {
                      NFTMarketplace.once("ItemUpdated", async (nftAddress, fetchedTokenId, seller, price) => {
                          try {
                              console.log("\x1b[32m%s\x1b[0m", `NFT Address: ${nftAddress}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT TokenId: ${fetchedTokenId.toString()}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT Seller/Owner Address: ${seller}`);
                              console.log("\x1b[32m%s\x1b[0m", `NFT New Price: ${ethers.utils.formatEther(price)} ETH`);

                              assert.equal(seller, deployer);
                              assert.equal(nftAddress, BasicNFT.address);
                              assert.equal(fetchedTokenId.toString(), tokenId.toString());
                              assert.equal(price.toString(), newNftPrice.toString());
                              resolve();
                          } catch (e) {
                              console.log("\x1b[31m%s\x1b[0m", `NFTMarketplace.test.js -- unit -- ERROR: ${e}`);
                              reject(e);
                          }
                      });

                      const txResponse = await NFTMarketplace.updateItem(
                          BasicNFT.address,
                          tokenId,
                          newNftPrice.toString()
                      );
                      await txResponse.wait(1);

                      console.log("\x1b[33m%s\x1b[0m", "Waiting for NFT to be Updated...");
                  });
              });
          });

          describe("\x1b[30mwithdrawProceeds\x1b[0m", () => {
              beforeEach(async () => {
                  const txResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice.toString());
                  await txResponse.wait(1);
              });

              it("\x1b[34mShould withdraw all Proceeds Successfully!", async () => {
                  const anotherUserWithNFTMarketplace = await NFTMarketplace.connect(signers[1]);
                  const txResponse = await anotherUserWithNFTMarketplace.buyItem(BasicNFT.address, tokenId, {
                      value: nftPrice.toString(),
                  });
                  await txResponse.wait(1);

                  const proceedsBefore = await NFTMarketplace.getProceeds();

                  const withdrawProceedsTxResponse = await NFTMarketplace.withdrawProceeds();
                  await withdrawProceedsTxResponse.wait(1);

                  const proceedsAfter = await NFTMarketplace.getProceeds();

                  console.log("\x1b[32m%s\x1b[0m", `Proceeds before Withdrawal: ${proceedsBefore.toString()}`);
                  console.log("\x1b[32m%s\x1b[0m", `Proceeds after Withdrawal: ${proceedsAfter.toString()}`);

                  assert.equal(proceedsBefore.toString(), nftPrice.toString());
                  assert.equal(proceedsAfter.toString(), "0");
              });

              it("\x1b[34mShould be reverted with msg \x1b[36m'NFTMarketplace__NoProceedsToWithdraw' \x1b[34m!\x1b[0m", async () => {
                  await expect(NFTMarketplace.withdrawProceeds()).to.be.revertedWithCustomError(
                      NFTMarketplace,
                      "NFTMarketplace__NoProceedsToWithdraw"
                  );
              });
          });
      });
