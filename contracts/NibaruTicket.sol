// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract NibaruTicket is ERC721, ERC2981, Ownable {
    uint256 public nextId;
    uint256 public maxSupply;
    string private _baseTokenURI;
    uint256 public priceWei = 0; // set > 0 for paid mints

    event Minted(address indexed minter, uint256 tokenId);

    constructor(
        string memory name_, 
        string memory symbol_, 
        string memory baseURI_, 
        uint96 royaltyBps_, 
        uint256 maxSupply_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        _setDefaultRoyalty(msg.sender, royaltyBps_); // e.g., 500 = 5%
    }

    function setBaseURI(string memory uri) external onlyOwner { _baseTokenURI = uri; }
    function setPrice(uint256 weiPrice) external onlyOwner { priceWei = weiPrice; }
    function setMaxSupply(uint256 s) external onlyOwner { require(s >= nextId, "lt minted"); maxSupply = s; }
    function setRoyalty(address receiver, uint96 bps) external onlyOwner { _setDefaultRoyalty(receiver, bps); }

    function mint(uint256 qty) external payable {
        require(qty > 0 && qty <= 10, "qty");
        require(nextId + qty <= maxSupply, "sold out");
        require(msg.value == priceWei * qty, "price");
        for (uint256 i = 0; i < qty; i++) {
            uint256 id = ++nextId;
            _safeMint(msg.sender, id);
            emit Minted(msg.sender, id);
        }
    }

    function withdraw(address payable to) external onlyOwner { to.transfer(address(this).balance); }

    function _baseURI() internal view override returns (string memory) { return _baseTokenURI; }

    function supportsInterface(bytes4 iid) public view override(ERC721, ERC2981) returns (bool) {
        return ERC721.supportsInterface(iid) || ERC2981.supportsInterface(iid);
    }
}
