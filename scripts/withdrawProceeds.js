const { ethers, getNamedAccounts } = require("hardhat");

const withdrawProceeds = async () => {
    const { deployer } = await getNamedAccounts();
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Fetching Proceeds of Sellers, Please wait...");

    const proceeds = await NFTMarketplace.getProceeds();

    console.log("\x1b[36m%s\x1b[0m", `Seller's Proceeds: ${ethers.utils.formatEther(proceeds.toString())} ETH`);
    console.log("\x1b[32m%s\x1b[0m", "Seller's Proceeds Retrieved Successfully!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Withdrawing Proceeds, Please wait...");

    const withdrawTxResponse = await NFTMarketplace.withdrawProceeds();
    await withdrawTxResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "Proceeds Withdrawal Succeed!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Checking if Any Proceed(s) remained?, Please wait...");

    const newProceeds = await NFTMarketplace.getProceeds();

    console.log("\x1b[36m%s\x1b[0m", `Remaining Proceeds: ${newProceeds.toString()}`);
    console.log("\x1b[32m%s\x1b[0m", "Proceeds Checked!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");
};

withdrawProceeds()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", ` -- withdrawProceeds.js -- ERROR: ${err}`);
        process.exit(1);
    });
