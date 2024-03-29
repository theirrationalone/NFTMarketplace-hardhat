const { network } = require("hardhat");
const { developmentChains } = require("../helper-config");
const verify = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const args = [];

    log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    log("\x1b[33m%s\x1b[0m", "Deploying NFTMarketplace Contract, Please wait...");

    const NFTMarketplace = await deploy("NFTMarketplace", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log("\x1b[32m%s\x1b[0m", "NFTMarketplace Contract Deployed Successfully!");
    log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    log("");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");

        await verify(NFTMarketplace.address, args);

        log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
        log("");
    }
};

module.exports.tags = ["all", "NFTMarketplace", "main"];

// 0x15Cfb3d8eDb65A61a5Bec4BbcE8cF422B067b1a7 -- NFTMarketplace goerli
// 0x3b52Ab92662bbF5E0701c1Be2373eefD45172fff -- BasicNFT goerli
// deployed ipfs: QmSjzqTCdjVd77U2FjALRGny8LcW6QHDjDtTXNxZzQfteR
