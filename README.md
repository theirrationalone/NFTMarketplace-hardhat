# NFTMarketplace Hardhat Project

This project demonstrates NFTMarketplace Powered By Hardhat. NFTMarketplace Project Allows to List, Buy, Cancel, Update and withdraw the Proceeds of NFTs. It provides scripts for deploying, minting, listing, cancelling, updating and withdrawing NFTs and NFTMarketplace, it also comes with a verbose testing script for testing NFTMarketplace.

# If You want to run this project on "GOERLI" testnet and don't know how to get Ready Your Project to work with "GOERLI TESTNET" and Having ETH fund/balance Issue. click <a href="https://github.com/theirrationalone/solidity-smart-contract-ethersjs/blob/main/README.md" target="blank">here</a>

<br />
<br />
<br />

## **SETTING ENVIRONMENT VARIABLES**

#### **Create a file .env and add keys given below with your credentials**

-   GOERLI_RPC_URL=your-rpc-from-alchemy-app

-   METAMASK_PRIVATE_KEY=your-metamask-private-key

-   COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

-   ETHERSCAN_API_KEY=your-etherscan-api-key

<br />

if you don't have etherscan api key then Go [here](https://etherscan.io/register) and signup/login here. After signing up or logging in click on 'API KEYS' then click on 'Add' you would've your etherscan api key.

if you don't have coinmarketcap api key then Go [here](https://pro.coinmarketcap.com/signup) and signup/login here. After signing up or logging in you would've your coinmarketcap api key.

<br />
<br />
<hr>

## **RUNNING SCRIPTS**

# **Note**: <h1 style="color: yellow;">Follow Steps below if You are running your project on vs code otherwise open your <span style="color: blue; font-weight: bold; font-size: 48px;">terminal / shell / bash / cmd</span>, with admin privileges then go to your project's directory i.e. as on windows "C:/users/username/documents/your_project/" and then paste and run commands given below in sequence.</h1>

<br />
<br />
<br />

# Copy code below, Go to Your Project, Open Terminal then paste it into terminal.

```shell
npm install --force
```

<br />

# Try running some of the following tasks: 🚀🚀🚀

```shell
npx hardhat help
npx hardhat test
npx hardhat test --network goerli
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat node
npx hardhat run scripts/BasicNFT.js
npx hardhat run scripts/BasicNFT.js --network goerli
npx hardhat run scripts/listItem.js
npx hardhat run scripts/listItem.js --network goerli
npx hardhat run scripts/updateItem.js
npx hardhat run scripts/updateItem.js --network goerli
npx hardhat run scripts/cancelItem.js
npx hardhat run scripts/cancelItem.js --network goerli
```

<br />

# **Note**: Try running commands below in sequence, Please run first command in a separate Terminal.

```shell
npx hardhat node
npx hardhat test --network localhost
npx hardhat run scripts/BasicNFT.js --network localhost
npx hardhat run scripts/listItem.js --network localhost
npx hardhat run scripts/updateItem.js --network localhost
npx hardhat run scripts/cancelItem.js --network localhost
npx hardhat run scripts/buy.js --network localhost
npx hardhat run scripts/withdrawProceeds.js --network localhost
```

<br />

# Try running Command Given Below...

## <div style="color: purple; font-weight: bolder;">Shows all available command: </div>

```shell
npx hardhat
```

<br />
<br />


# Thank You! :) 🏴‍☠️