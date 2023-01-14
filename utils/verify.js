const { run } = require("hardhat");

module.exports = async (address, constructorArguments) => {
    try {
        console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
        console.log("\x1b[33m%s\x1b[0m", "Verifying NFT Contract on Etherscan, Please wait...");
        await run("verify:verify", {
            address,
            constructorArguments,
        });
        console.log("\x1b[32m%s\x1b[0m", "NFT Contract Verified Successfully!");
        console.log("\x1b[34m%s\x1b[0m", "------------------------------------------------------------");
    } catch (e) {
        if (!!e.message.toLowerCase().includes("already verified")) {
            console.log("\x1b[32m%s\x1b[0m", "NFT Contract Already Verified! :)");
        } else {
            console.log("\x1b[31m%s\x1b[0m", `verify.js -- ERROR: ${e}`);
        }
    }
};
