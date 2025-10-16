// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * NibaruTicketAllowlist
 * - ERC721 + ERC2981
 * - Merkle allowlist for discounted/early mints
 * - Public mint can remain open if desired
 */
contract NibaruTicketAllowlist is ERC721, ERC2981, Ownable {
    uint256 public nextId;
    uint256 public maxSupply;
    string private _baseTokenURI;

    // pricing / limits
    uint256 public publicPriceWei;
    uint256 public allowPriceWei;
    uint256 public maxPerWallet = 3;

    // sales
    bool public publicSaleActive = false;
    bool public allowSaleActive = true;

    // merkle root
    bytes32 public allowlistRoot;

    mapping(address => uint256) public mintedBy;

    event Minted(address indexed minter, uint256 tokenId);
    event AllowlistRootUpdated(bytes32 root);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint96 royaltyBps_,
        uint256 maxSupply_,
        bytes32 allowlistRoot_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        _setDefaultRoyalty(msg.sender, royaltyBps_);
        allowlistRoot = allowlistRoot_;
        publicPriceWei = 0.01 ether;
        allowPriceWei = 0 ether;
    }

    // --- admin ---
    function setBaseURI(string memory uri) external onlyOwner { _baseTokenURI = uri; }
    function setPrices(uint256 publicWei, uint256 allowWei) external onlyOwner { publicPriceWei = publicWei; allowPriceWei = allowWei; }
    function setMaxPerWallet(uint256 n) external onlyOwner { maxPerWallet = n; }
    function setMaxSupply(uint256 s) external onlyOwner { require(s >= nextId, "lt minted"); maxSupply = s; }
    function setSaleStates(bool _public, bool _allow) external onlyOwner { publicSaleActive = _public; allowSaleActive = _allow; }
    function setAllowlistRoot(bytes32 root) external onlyOwner { allowlistRoot = root; emit AllowlistRootUpdated(root); }
    function setRoyalty(address receiver, uint96 bps) external onlyOwner { _setDefaultRoyalty(receiver, bps); }

    // --- mints ---
    function mintPublic(uint256 qty) external payable {
        require(publicSaleActive, "public off");
        _coreMint(qty, publicPriceWei);
    }

    function mintAllowlist(uint256 qty, bytes32[] calldata proof) external payable {
        require(allowSaleActive, "allow off");
        require(_isAllowlisted(msg.sender, proof), "not allowlisted");
        _coreMint(qty, allowPriceWei);
    }

    function _coreMint(uint256 qty, uint256 price) internal {
        require(qty > 0 && qty <= 10, "qty");
        require(nextId + qty <= maxSupply, "sold out");
        require(mintedBy[msg.sender] + qty <= maxPerWallet, "wallet limit");
        require(msg.value == price * qty, "price");

        mintedBy[msg.sender] += qty;
        for (uint256 i = 0; i < qty; i++) {
            uint256 id = ++nextId;
            _safeMint(msg.sender, id);
            emit Minted(msg.sender, id);
        }
    }

    function _isAllowlisted(address a, bytes32[] calldata proof) internal view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(a))));
        return MerkleProof.verify(proof, allowlistRoot, leaf);
    }

    function withdraw(address payable to) external onlyOwner { to.transfer(address(this).balance); }

    function _baseURI() internal view override returns (string memory) { return _baseTokenURI; }

    function supportsInterface(bytes4 iid) public view override(ERC721, ERC2981) returns (bool) {
        return ERC721.supportsInterface(iid) || ERC2981.supportsInterface(iid);
    }
}
