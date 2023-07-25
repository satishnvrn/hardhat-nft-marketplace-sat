// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NftMarketPlace_PriceMustBeAboveZero();
error NftMarketPlace_NotApprovedForMarketplace();
error NftMarketPlace_NotListed(address nftAddress, uint256 tokenId);
error NftMarketPlace_NotOwner();
error NftMarketPlace_PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);

contract NftMarketPlace {
    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;

    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketPlace_NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketPlace_NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketPlace_NotOwner();
        }
        _;
    }

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketPlace_PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketPlace_NotApprovedForMarketplace();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketPlace_PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }
        // TODO: mark the proceeds as sold.
        // TODO: delete from the listings.
        // TODO: emit event.
    }
}
