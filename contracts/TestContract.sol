// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "./interfaces/IERC20.sol";

contract TestContract {
    string public constant name = "TestContract";
    string public constant version = "1";
    address public immutable USDC;
    mapping(address => uint) public deposits;

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public immutable DEPOSIT_TYPEHASH;

    constructor(address USDC_, uint256 chainId_) {
        USDC = USDC_;
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)),
            keccak256(bytes(version)),
            chainId_,
            address(this)
        ));
        DEPOSIT_TYPEHASH = keccak256("DepositWithPermit(uint256 amount)");
    }

    function deposit(uint256 amount) external {
        _deposit(msg.sender, amount);
    }

    function depositWithPermit(
        address signer,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(verify(signer, v, r, s, keccak256(abi.encode(DEPOSIT_TYPEHASH, amount))), 'ERR: INVALID_VERIFY');
        _deposit(signer, amount);
    }

    function _deposit(address address_, uint256 amount) internal {
        require(amount > 0, 'ERR: INVALID_AMOUNT');
        deposits[address_] += amount;
        IERC20(USDC).transferFrom(address_, address(this), amount);
    }

    function verify(
        address signer,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes32 encodedData
    ) public view returns (bool) {
        bytes32 digest =
            keccak256(abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                encodedData
            )
        );
        return signer == ecrecover(digest, v, r, s);
    }

    function withdraw() external {
        uint amountToWithdraw = deposits[msg.sender];
        require(amountToWithdraw > 0, 'ERR: INVALID_AMOUNT');

        deposits[msg.sender] = 0;
        IERC20(USDC).transfer(msg.sender, amountToWithdraw);
    }
}