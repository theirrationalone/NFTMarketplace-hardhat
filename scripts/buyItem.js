const fs = require("fs");
const { ethers, getNamedAccounts } = require("hardhat");

const buyItem = async () => {
    const { deployer } = await getNamedAccounts();
    const signers = await ethers.getSigners();
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);

    const NFTMarketplace = await ethers.getContract("NFTMarketplace", signers[1]);
    const nftPrice = JSON.parse(fs.readFileSync("./fileDb/latestPrice.json", "utf8")).price;
    const tokenId = JSON.parse(fs.readFileSync("./fileDb/tokenIds.json", "utf8")).tokenId;

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Buying BasicNFT, Please wait...");

    const buyTxResponse = await NFTMarketplace.buyItem(BasicNFT.address, tokenId, {
        value: nftPrice,
    });
    await buyTxResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "NFT Bought!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");
};

buyItem()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- buyItem.js -- ERROR: ${err}`);
        process.exit(1);
    });
