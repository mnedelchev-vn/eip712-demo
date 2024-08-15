const { ethers } = require("hardhat")
const { expect } = require("chai");
require("dotenv").config();

async function impersonateAddress(address) {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
    });
    const signer = await ethers.provider.getSigner(address);
    signer.address = signer.address;
    return signer;
}

describe("EIP721 Test", function () {
    let owner;
    let user1;
    let user2;
    let usdcHolder;
    let TestContract;
    let usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    let USDC;
    const CHAIN_ID = 1;

    before(async function () {
        let signers = await ethers.getSigners();
        owner = signers[0];
        user1 = signers[1];
        user2 = signers[2];
        usdcHolder = await impersonateAddress("0xaaef851977578d9CDF0042fB88F4532b9Ef602B2"); // Holder
        TestContract = await hre.ethers.getContractFactory('TestContract');
        TestContract = await TestContract.deploy(usdcAddress, CHAIN_ID);
        USDC = await hre.ethers.getContractAt('contracts/interfaces/IERC20.sol:IERC20', usdcAddress);

        await USDC.connect(usdcHolder).transfer(user1.address, ethers.parseUnits('10000', 6));
        await USDC.connect(usdcHolder).transfer(user2.address, ethers.parseUnits('10000', 6));
    });

    it("Test validate pre-signed deposit", async function () {
        let initialUser1Balance = await USDC.balanceOf(user1.address);
        let initialUser2Balance = await USDC.balanceOf(user2.address);

        const amount = ethers.parseUnits('1000', 6);
        await USDC.connect(user1).approve(TestContract.target, amount);
        await USDC.connect(user2).approve(TestContract.target, amount);

        await TestContract.connect(user2).deposit(amount);
        expect(initialUser2Balance).to.be.greaterThan(await USDC.balanceOf(user2.address));

        const signerNonce = await TestContract.nonces(user1.address);
        const message = {
            amount: amount,
            nonce: signerNonce
        };
        const domain = {
            name: 'TestContract',
            version: '1',
            chainId: CHAIN_ID,
            verifyingContract: TestContract.target
        };
        const types = {
            DepositWithPermit: [
                { name: "amount", type: "uint256" }
            ]
        };
        let signedTypedData = await user1.signTypedData(domain, types, message);
        let { v, r, s } = ethers.Signature.from(signedTypedData);

        await TestContract.connect(user2).depositWithPermit(user1.address, amount, signerNonce, v, r, s);
        expect(initialUser1Balance).to.be.greaterThan(await USDC.balanceOf(user1.address));

        // trying to deposit again with the same signed message
        await expect(
            TestContract.connect(user2).depositWithPermit(user1.address, amount, signerNonce, v, r, s)
        ).to.be.revertedWithCustomError(
            TestContract,
            "InvalidNonce"
        );

        console.log(await USDC.balanceOf(user1.address), 'user1 balance AFTER 2nd permitted deposit');
        console.log(await USDC.balanceOf(user2.address), 'user2 balance AFTER 2nd permitted deposit');
    });
});
