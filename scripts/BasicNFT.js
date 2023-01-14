const { getNamedAccounts, ethers } = require("hardhat");

const BasicNFT = async () => {
    const { deployer } = await getNamedAccounts();
    const BasicNFTContract = await ethers.getContract("BasicNFT", deployer);

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Fetching Current Token Id, Please wait...");

    const currentToken = await BasicNFTContract.getCurrentToken();

    console.log("\x1b[36m%s\x1b[0m", `Current TokenId: ${currentToken.toString()}`);
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Minting BasicNFT, Please wait...");

    await new Promise(async (resolve, reject) => {
        BasicNFTContract.once("NFTMinted", async (nftOwner, tokenId) => {
            try {
                console.log(
                    "\x1b[36m%s\x1b[0m",
                    `BasicNFT with tokenId: ${tokenId.toString()} and NFT Owner with address: ${nftOwner} has been minted!`
                );
                resolve();
            } catch (e) {
                console.log("\x1b[31m%s\x1b[0m", `mint.js -- ERROR: ${e}`);
                reject(e);
            }
        });

        const txResponse = await BasicNFTContract.mintNFT();
        await txResponse.wait(1);
    });

    console.log("\x1b[32m%s\x1b[0m", "BasicNFT Minted Successfully!");
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Fetching Dog URI, Please wait...");
    const dogTokenURI = await BasicNFTContract.tokenURI("0");

    console.log("\x1b[36m%s\x1b[0m", `DOG TokenURI: ${dogTokenURI.toString()}`);
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");

    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("\x1b[33m%s\x1b[0m", "Fetching Updated Token Id, Please wait...");

    const updatedTokenId = await BasicNFTContract.getCurrentToken();

    console.log("\x1b[36m%s\x1b[0m", `Updated TokenId: ${updatedTokenId.toString()}`);
    console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    console.log("");
};

BasicNFT()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log("\x1b[31m%s\x1b[0m", `BasicNFT.js -- scripts -- ERROR: ${e}`);
        process.exit(1);
    });
