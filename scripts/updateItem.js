const fs = require("fs");
const { ethers, getNamedAccounts } = require("hardhat");

const updateItem = async () => {
    const { deployer } = await getNamedAccounts();
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);
    const nftPrice = ethers.utils.parseEther("0.05").toString();
    const tokenId = JSON.parse(fs.readFileSync("./fileDb/tokenIds.json", "utf8")).tokenId;

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Updating BasicNFT, Please wait...");

    const updateTxResponse = await NFTMarketplace.updateItem(BasicNFT.address, tokenId, nftPrice);
    await updateTxResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "NFT Updated!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Fetching Updated Data, Please wait...");
    const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

    fs.writeFileSync("./fileDb/latestPrice.json", JSON.stringify({ price: price.toString() }), "utf8");

    console.log("\x1b[36m%s\x1b[0m", `Updated NFT Price: ${ethers.utils.formatEther(price.toString())} ETH`);
    console.log("\x1b[36m%s\x1b[0m", `Updated NFT selller: ${seller.toString()}`);
    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "NFT Updated data Retrieved Successfully!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");
};

updateItem()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- updateItem.js -- ERROR: ${err}`);
        process.exit(1);
    });
