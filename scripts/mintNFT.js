const fs = require("fs");
const { ethers, getNamedAccounts } = require("hardhat");

const mintNFT = async () => {
    const { deployer } = await getNamedAccounts();
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);

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
};

mintNFT()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- mintNFT.js -- ERROR: ${err}`);
    });
