require('dotenv').config()
const { ethers } = require('ethers')
const provider = new ethers.WebSocketProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const gas_price = 10
const gas_limit = 21000

provider.on('pending', (txHash) => {
    setTimeout(async () => {
        try {
            let tx = await provider.getTransaction(txHash)
            if (tx && tx.to && tx.to.toLowerCase() == wallet.address.toLowerCase() && tx.value) {
                console.log(txHash, tx.value)
                console.log(await wallet.sendTransaction({
                    chainId: process.env.CHAIN_ID,
                    to: process.env.TO_WALLET,
                    value: tx.value - ethers.parseUnits('' + (gas_price * gas_limit), 'gwei'),
                    gasLimit: gas_limit,
                    gasPrice: ethers.parseUnits('' + gas_price, 'gwei')
                }))
            }
        } catch (err) {
            console.error('Error:', err)
        }
    })
})