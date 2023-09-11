const { ethers } = require("hardhat")
const { expect } = require("chai");
require("dotenv").config();

async function impersonateAddress(address) {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
    });
    const signer = await ethers.provider.getSigner(address);
    signer.address = signer._address;
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
        usdcHolder = await impersonateAddress("0xaaef851977578d9CDF0042fB88F4532b9Ef602B2");
        TestContract = await hre.ethers.getContractFactory('TestContract');
        TestContract = await TestContract.deploy(usdcAddress, CHAIN_ID);
        USDC = await hre.ethers.getContractAt('contracts/interfaces/IERC20.sol:IERC20', usdcAddress);

        await USDC.connect(usdcHolder).transfer(user1.address, ethers.utils.parseUnits('10000', 6));
        await USDC.connect(usdcHolder).transfer(user2.address, ethers.utils.parseUnits('10000', 6));
    });

    it("Test validate pre-signed deposit", async function () {
        let initialUser1Balance = await USDC.balanceOf(user1.address);
        let initialUser2Balance = await USDC.balanceOf(user2.address);
        console.log(initialUser1Balance, 'user1 balance');
        console.log(initialUser2Balance, 'user2 balance');

        const amount = ethers.utils.parseUnits('1000', 6);
        await USDC.connect(user1).approve(TestContract.address, amount);
        await USDC.connect(user2).approve(TestContract.address, amount);

        await TestContract.connect(user2).deposit(amount);
        expect(await USDC.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(initialUser2Balance).sub(amount));

        const signerNonce = await TestContract.nonces(user1.address);
        const message = {
            amount: amount,
            nonce: signerNonce
        };
        const domain = {
            name: 'TestContract',
            version: '1',
            chainId: CHAIN_ID,
            verifyingContract: TestContract.address
        };
        const types = {
            DepositWithPermit: [
                { name: "amount", type: "uint256" }
            ]
        };
        let signedTypedData = await user1._signTypedData(domain, types, message);
        let { v, r, s } = ethers.utils.splitSignature(signedTypedData);

        await TestContract.connect(user2).depositWithPermit(user1.address, amount, signerNonce, v, r, s);
        expect(await USDC.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(initialUser1Balance).sub(amount));

        // trying to deposit again with the same signed message
        await expect(
            TestContract.connect(user2).depositWithPermit(user1.address, amount, signerNonce, v, r, s)
        ).to.be.revertedWithCustomError(
            TestContract,
            "InvalidNonce"
        );
        expect(await USDC.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(initialUser1Balance).sub(amount));

        console.log(await USDC.balanceOf(user1.address), 'user1 balance AFTER 2nd permitted deposit');
        console.log(await USDC.balanceOf(user2.address), 'user2 balance AFTER 2nd permitted deposit');
    });
});
