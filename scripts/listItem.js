const fs = require("fs");
const { ethers, getNamedAccounts } = require("hardhat");

const listItem = async () => {
    const { deployer } = await getNamedAccounts();
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);
    const nftPrice = ethers.utils.parseEther("0.01").toString();

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Minting BasicNFT, Please wait...");

    const mintTxResponse = await BasicNFT.mintNFT();
    const mintTxReceipt = await mintTxResponse.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId.toString();

    const data = JSON.stringify({ tokenId: tokenId });

    fs.writeFileSync("./fileDb/tokenIds.json", data, "utf8");

    console.log("\x1b[32m%s\x1b[0m", "BasicNFT Minted!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Approving BasicNFT for NFTMarketplace, Please wait...");

    await BasicNFT.approve(NFTMarketplace.address, tokenId);

    console.log("\x1b[32m%s\x1b[0m", "BasicNFT Approved!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Listing NFT, Please wait...");

    const listNFTTxResponse = await NFTMarketplace.listItem(BasicNFT.address, tokenId, nftPrice);
    await listNFTTxResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "NFT Listed!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Fetching Listed Data, Please wait...");
    const { price, seller } = await NFTMarketplace.getListings(BasicNFT.address, tokenId);

    fs.writeFileSync("./fileDb/latestPrice.json", JSON.stringify({ price: price.toString() }), "utf8");

    console.log("\x1b[36m%s\x1b[0m", `Listed NFT Price: ${ethers.utils.formatEther(price.toString())} ETH`);
    console.log("\x1b[36m%s\x1b[0m", `Listed NFT selller: ${seller.toString()}`);
    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "NFT data Retrieved Successfully!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");
};

listItem()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- listItem.js -- ERROR: ${err}`);
    });
