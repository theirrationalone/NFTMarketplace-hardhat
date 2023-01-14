const { network } = require("hardhat");
const { developmentChains } = require("../helper-config");
const verify = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const args = [];

    log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    log("\x1b[33m%s\x1b[0m", "Deploying BasicNFT Contract, Please wait...");

    const BasicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log("\x1b[32m%s\x1b[0m", "BasicNFT Contract Deployed Successfully!");
    log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    log("");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");

        await verify(BasicNFT.address, args);

        log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
        log("");
    }
};

module.exports.tags = ["all", "BasicNFT", "main"];
