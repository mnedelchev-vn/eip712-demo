# EIP712 DEMO

### Project setup commands:
* ```npm install``` - Downloading required packages.

### Before starting make sure to create .env file at the root of the project containing the following data:
```
    MAINNET_NODE=XYZ
```
    
### PURPOSE:
This is a **DEMO** project just to test the functionality of EIP712. ```contracts/TestContract.sol``` has a method called ```depositWithPermit``` which is verifying off-chain signed messages. Run ```npx hardhat test test/TestVerifyEIP721.js``` to reproduce the submission of the off-chain presigned transaction & the on-chain validation.