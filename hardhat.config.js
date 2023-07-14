require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
// require("hardhat-gas-reporter")
require("dotenv").config();
require('hardhat-abi-exporter')


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    defaultNetwork: 'hardhat',
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    //   gasReporter: {
    //     enabled:true,
    //     currency: 'USD',
    //     gasPrice: 21
    //   },
    abiExporter: {
        path: './abi',
        runOnCompile: false,
        clear: true,
        flat: true,
        except: ['I[A-Z]*','BaseModule'], //:ERC20$'
        spacing: 2,
        // pretty: true,
        format: "json",
      },
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
            },
            {
                version: '0.8.17',
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                }
            },
            {
                version: '0.8.15',
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                }
            },
            {
                version: '0.8.0',
                settings: {
                    viaIR: true,
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                }
            },
            {
                version: '0.7.6',
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
        },
        // hardhatGoerli: {
        //     forking: {
        //         live: false,
        //         saveDeployments: false,
        //         accounts: [process.env.PRIVATE_KEY_OWNER, process.env.USER_PRIVATE_KEY],
        //         url: process.env.GOERLI_NODE,
        //     }
        // },
        // hardhatSepolia: {
        //     forking: {
        //         live: false,
        //         saveDeployments: false,
        //         accounts: [process.env.PRIVATE_KEY_OWNER, process.env.USER_PRIVATE_KEY],
        //         url: process.env.SEPOLIA_NODE,
        //     }
        // },
        mainnet: {
            url: process.env.MAINNET_NODE || "https://rpc.ankr.com/eth",
            accounts: [process.env.PRIVATE_KEY_OWNER],
            tags: ['prod'],
            gasMultiplier: 1.2,
            maxFeePerGas: 25,
            maxPriorityFeePerGas: 0.8
        },
        goerli: {
            url: process.env.GOERLI_NODE || "https://rpc.ankr.com/eth_goerli",
            accounts: [process.env.PRIVATE_KEY_OWNER, process.env.USER_PRIVATE_KEY],
            tags: ['test'],
            gasMultiplier: 1.2,
            maxFeePerGas: 200,
            maxPriorityFeePerGas: 10
        },
        sepolia: {
            url: process.env.SEPOLIA_NODE || "https://rpc.ankr.com/eth_sepolia",
            accounts: [process.env.PRIVATE_KEY_OWNER, process.env.USER_PRIVATE_KEY],
            tags: ['test'],
            gasMultiplier: 1.2,
            maxFeePerGas: 200,
            maxPriorityFeePerGas: 10
        }

    },
    mocha: {
         timeout: 60000
    }
};