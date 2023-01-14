const fs = require("fs");
const { ethers, getNamedAccounts } = require("hardhat");

const cancelItem = async () => {
    const { deployer } = await getNamedAccounts();
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);
    const tokenId = JSON.parse(fs.readFileSync("./fileDb/tokenIds.json", "utf8")).tokenId;

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Canceling BasicNFT, Please wait...");

    const cancelTxResponse = await NFTMarketplace.cancelItem(BasicNFT.address, tokenId);
    await cancelTxResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "NFT canceled!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Checking if NFT Still Listed?, Please wait...");
    const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

    console.log("\x1b[36m%s\x1b[0m", `NFT Price: ${ethers.utils.formatEther(price.toString())} ETH`);
    console.log("\x1b[36m%s\x1b[0m", `selller: ${seller.toString()}`);
    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "NFT Existence Checked!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");
};

cancelItem()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- cancelItem.js -- ERROR: ${err}`);
        process.exit(1);
    });
