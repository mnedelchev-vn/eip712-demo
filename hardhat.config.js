require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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