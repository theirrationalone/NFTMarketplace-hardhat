const fs = require("fs");
const { ethers, network } = require("hardhat");

const CONTRACT_ADDRESSES_FILE = "../project-09-nftmarketplace-frontend-hardhat/constants/contractAddresses.json";
const BASICNFT_CONTRACT_ABI_FILE = "../project-09-nftmarketplace-frontend-hardhat/constants/BasicNFTContractABI.json";
const NFTMARKETPLACE_CONTRACT_ABI_FILE =
    "../project-09-nftmarketplace-frontend-hardhat/constants/NFTMarketplaceContractABI.json";

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { log } = deployments;
    if (process.env.UPDATE_FRONTEND === "true") {
        log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
        console.log("\x1b[33m%s\x1b[0m", "Updating Frontend Support, Please wait...");

        await updateContractAddresses(deployer);
        await updateContractABI(deployer);

        log("\x1b[32m%s\x1b[0m", "Frontend Support Updated!");
        log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
        log("");
    }
};

const updateContractABI = async (deployer) => {
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);

    let BasicNFTContractABI = JSON.parse(fs.readFileSync(BASICNFT_CONTRACT_ABI_FILE, "utf8"));
    let NFTMarketplaceContractABI = JSON.parse(fs.readFileSync(NFTMARKETPLACE_CONTRACT_ABI_FILE, "utf8"));

    BasicNFTContractABI = BasicNFT.interface.format(ethers.utils.FormatTypes.json);
    NFTMarketplaceContractABI = NFTMarketplace.interface.format(ethers.utils.FormatTypes.json);

    fs.writeFileSync(BASICNFT_CONTRACT_ABI_FILE, BasicNFTContractABI, "utf8");
    fs.writeFileSync(NFTMARKETPLACE_CONTRACT_ABI_FILE, NFTMarketplaceContractABI, "utf8");
};

const updateContractAddresses = async (deployer) => {
    const NFTMarketplace = await ethers.getContract("NFTMarketplace", deployer);
    const BasicNFT = await ethers.getContract("BasicNFT", deployer);
    const chainId = network.config.chainId;

    let contractAddresses = JSON.parse(fs.readFileSync(CONTRACT_ADDRESSES_FILE, "utf8"));

    if (!!contractAddresses[chainId]) {
        if (!!contractAddresses[chainId]["NFTMarketplace"]) {
            if (!contractAddresses[chainId]["NFTMarketplace"].includes(NFTMarketplace.address)) {
                contractAddresses[chainId]["NFTMarketplace"].push(NFTMarketplace.address);
            }
        } else {
            contractAddresses[chainId] = {
                ...contractAddresses[chainId],
                NFTMarketplace: [NFTMarketplace.address],
            };
        }

        if (!!contractAddresses[chainId]["BasicNFT"]) {
            if (!contractAddresses[chainId]["BasicNFT"].includes(BasicNFT.address)) {
                contractAddresses[chainId]["BasicNFT"].push(BasicNFT.address);
            }
        } else {
            contractAddresses[chainId] = {
                ...contractAddresses[chainId],
                NFTMarketplace: [BasicNFT.address],
            };
        }
    } else {
        contractAddresses = {
            ...contractAddresses,
            [chainId]: {
                NFTMarketplace: [NFTMarketplace.address],
                BasicNFT: [BasicNFT.address],
            },
        };
    }

    fs.writeFileSync(CONTRACT_ADDRESSES_FILE, JSON.stringify(contractAddresses), "utf8");
};

module.exports.tags = ["all", "frontend"];
