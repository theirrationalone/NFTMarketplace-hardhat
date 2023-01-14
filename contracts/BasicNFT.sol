////////////////
/// LICENSE ///
//////////////
// SPDX-License-Identifier: MIT

/////////////////
/// COMPILER ///
///////////////
pragma solidity ^0.8.8;

////////////////
/// IMPORTS ///
//////////////
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title BasicNFT
 * @dev Basic NFT Contract, allows to mint basic dog image uri.
 * @param title for ERC721 Constructor
 * @param symbol for ERC721 Constructor
 * @author theirrationalone
 */

/////////////////
/// CONTRACT ///
///////////////
contract BasicNFT is ERC721 {
    ////////////////////////
    /// STATE VARIABLES ///
    //////////////////////
    uint256 private s_tokenCounter;
    string private constant BASIC_DOG_URI = "ipfs://bafybeie5venjwpgkqpthezwtyrm7bqm5wzkiukcvqdyftd4behdamkw3re/";

    ///////////////
    /// EVENTS ///
    /////////////
    event NFTMinted(address indexed nftOwner, uint256 indexed tokenId);

    //////////////////////////
    /// SPECIAL FUNCTIONS ///
    ////////////////////////
    constructor() ERC721("DOGGIE", "DOG") {
        s_tokenCounter = 0;
    }

    /////////////////////////////
    /// MUTATIONAL FUNCTIONS ///
    ///////////////////////////
    function mintNFT() public {
        _safeMint(msg.sender, s_tokenCounter);
        emit NFTMinted(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
    }

    function tokenURI(uint256 /* tokenId */) public pure override returns (string memory) {
        return BASIC_DOG_URI;
    }

    /////////////////////////
    /// HELPER FUNCTIONS ///
    ///////////////////////
    function getCurrentToken() public view returns (uint256) {
        return s_tokenCounter;
    }
}
