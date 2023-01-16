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
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

///////////////
/// ERRORS ///
/////////////
error NFTMarketplace___NftAlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketplace___NotOwner(address nftAddress, uint256 tokenId, address spender);
error NFTMarketplace___NftPriceMustBeGreaterThanZero();
error NFTMarketplace___NotApprovedForNFTMarketplace();
error NFTMarketplace___NftNotListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__notPaidEnoughToBuy(address nftAddress, uint256 tokenId);
error NFTMarketplace__NoProceedsToWithdraw();
error NFTMarketplace___WithdrawalOfProceedsFailed();
error NFTMarketplace__CannotBuySelfedOwnedNFTs(address buyer, address seller, address _nftAddress, uint256 _tokenId);

/**
 * @notice NFT Market Place, A Market for NFTs Exchange
 * @dev NftMarketplace, Here You can List, Purchase, Sell, Modify Your NFTs
 * @param noParams
 * @author theirrationalone
 */

/////////////////
/// CONTRACT ///
///////////////
contract NFTMarketplace is ReentrancyGuard {
    ///////////////////////////
    /// TYPES DECLARATIONS ///
    /////////////////////////
    struct Listings {
        uint256 price;
        address seller;
    }

    ////////////////////////
    /// STATE VARIABLES ///
    //////////////////////
    mapping(address => mapping(uint256 => Listings)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    //////////////////
    /// MODIFIERS ///
    ////////////////
    modifier notListed(address _nftAddress, uint256 _tokenId) {
        Listings memory listedItem = s_listings[_nftAddress][_tokenId];

        if (listedItem.price > 0) {
            revert NFTMarketplace___NftAlreadyListed(_nftAddress, _tokenId);
        }

        _;
    }

    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _spender
    ) {
        IERC721 nft = IERC721(_nftAddress);

        if (nft.ownerOf(_tokenId) != _spender) {
            revert NFTMarketplace___NotOwner(_nftAddress, _tokenId, _spender);
        }

        _;
    }

    modifier isListed(address _nftAddress, uint256 _tokenId) {
        Listings memory listedItem = s_listings[_nftAddress][_tokenId];

        if (listedItem.price <= 0) {
            revert NFTMarketplace___NftNotListed(_nftAddress, _tokenId);
        }

        _;
    }

    modifier notOwner(
        address _nftAddress,
        uint256 _tokenId,
        address buyer
    ) {
        address seller = s_listings[_nftAddress][_tokenId].seller;

        if (buyer == seller) {
            revert NFTMarketplace__CannotBuySelfedOwnedNFTs(buyer, seller, _nftAddress, _tokenId);
        }

        _;
    }

    ///////////////
    /// EVENTS ///
    /////////////
    event ItemListed(address indexed nftAddress, uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemBought(address indexed nftAddress, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ItemUpdated(address indexed nftAddress, uint256 indexed tokenId, address indexed seller, uint256 newPrice);
    event ItemCanceled(address indexed nftAddress, uint256 indexed tokenId, address indexed seller);

    /////////////////////////////
    /// MUTATIONAL FUNCTIONS ///
    ///////////////////////////
    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    ) external notListed(_nftAddress, _tokenId) isOwner(_nftAddress, _tokenId, msg.sender) {
        IERC721 nft = IERC721(_nftAddress);

        if (nft.getApproved(_tokenId) != address(this)) {
            revert NFTMarketplace___NotApprovedForNFTMarketplace();
        }

        if (_price <= 0) {
            revert NFTMarketplace___NftPriceMustBeGreaterThanZero();
        }

        s_listings[_nftAddress][_tokenId] = Listings(_price, msg.sender);

        emit ItemListed(_nftAddress, _tokenId, msg.sender, _price);
    }

    function buyItem(
        address _nftAddress,
        uint256 _tokenId
    ) external payable isListed(_nftAddress, _tokenId) notOwner(_nftAddress, _tokenId, msg.sender) nonReentrant {
        Listings memory listedItem = s_listings[_nftAddress][_tokenId];

        if (msg.value < listedItem.price) {
            revert NFTMarketplace__notPaidEnoughToBuy(_nftAddress, _tokenId);
        }

        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[_nftAddress][_tokenId]);

        IERC721(_nftAddress).safeTransferFrom(listedItem.seller, msg.sender, _tokenId);

        emit ItemBought(_nftAddress, _tokenId, msg.sender, listedItem.price);
    }

    function cancelItem(
        address _nftAddress,
        uint256 _tokenId
    ) external isOwner(_nftAddress, _tokenId, msg.sender) isListed(_nftAddress, _tokenId) {
        delete (s_listings[_nftAddress][_tokenId]);

        emit ItemCanceled(_nftAddress, _tokenId, msg.sender);
    }

    function updateItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _newPrice
    ) external isOwner(_nftAddress, _tokenId, msg.sender) isListed(_nftAddress, _tokenId) nonReentrant {
        if (_newPrice <= 0) {
            revert NFTMarketplace___NftPriceMustBeGreaterThanZero();
        }

        Listings memory listedItem = s_listings[_nftAddress][_tokenId];

        s_listings[_nftAddress][_tokenId].price = _newPrice;

        emit ItemUpdated(_nftAddress, _tokenId, listedItem.seller, _newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NFTMarketplace__NoProceedsToWithdraw();
        }

        s_proceeds[msg.sender] = 0;

        (bool isSuccess, ) = payable(msg.sender).call{value: proceeds}("");

        if (!isSuccess) {
            revert NFTMarketplace___WithdrawalOfProceedsFailed();
        }
    }

    //////////////////////////////////
    /// HELPER / GETTER FUNCTIONS ///
    ////////////////////////////////
    function getListings(address _nftAddress, uint256 _tokenId) public view returns (Listings memory) {
        return s_listings[_nftAddress][_tokenId];
    }

    function getProceeds() public view returns (uint256) {
        return s_proceeds[msg.sender];
    }
}
