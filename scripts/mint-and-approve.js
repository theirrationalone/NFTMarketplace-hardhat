const fs = require("fs");
const { ethers, getNamedAccounts } = require("hardhat");

const mintAndListNFT = async () => {
    const { deployer } = await getNamedAccounts();
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Minting BasicNFT, Please wait...");

    const mintTxResponse = await BasicNFT.mintNFT();
    const mintTxReceipt = await mintTxResponse.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId.toString();

    console.log("\x1b[32m%s\x1b[0m", `BasicNFT Address: ${BasicNFT.address}`);
    console.log("\x1b[32m%s\x1b[0m", `tokenId: ${tokenId}`);

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
};

mintAndListNFT()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- listItem.js -- ERROR: ${err}`);
    });
