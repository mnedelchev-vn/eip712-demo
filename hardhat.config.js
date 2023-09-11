require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
// require("hardhat-gas-reporter")
require("dotenv").config();
require('hardhat-abi-exporter')


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    defaultNetwork: 'hardhat',
    solidity: {
        compilers: [
            {
                version: '0.8.19',
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                }
            }
        ]
    },
    networks: {
        hardhat: {
            forking: {
                live: false,
                saveDeployments: false,
                accounts: [process.env.PRIVATE_KEY_OWNER, process.env.USER_PRIVATE_KEY],
                url: process.env.MAINNET_NODE || "https://rpc.ankr.com/eth"
            }
        }

    },
    mocha: {
         timeout: 60000
    }
};