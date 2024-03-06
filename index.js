require('dotenv').config();
const { ethers } = require('ethers');

const gas_price = process.env.GAS_PRICE
const gas_limit = process.env.GAS_LIMIT
const gas_fee = ethers.parseUnits('' + (gas_price * gas_limit), 'gwei')
const gas_price_eth = ethers.parseUnits('' + gas_price, 'gwei')
const limit_balance = ethers.parseUnits('' + process.env.LIMIT_BALANCE, 'ether')

const provider = new ethers.WebSocketProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const loop = async (provider, wallet) => {
    try {
        const balance = await (await provider).getBalance(wallet.address)
        console.log('Balance:', balance)
        if (balance - limit_balance <= gas_fee)
            return true

        let tx = await (await wallet).sendTransaction({
            chainId: process.env.CHAIN_ID,
            to: process.env.TO_WALLET,
            value: balance - gas_fee,
            gasLimit: gas_limit,
            gasPrice: gas_price_eth,
            nonce: await wallet.getNonce()
        })
        console.log('Transaction:', tx.hash)

        let ret = await tx.wait()
        if (ret)
            console.log('Completed transaction!')
        else
            console.log('Failed in transaction!')

        return true
    } catch (err) {
        console.error("Loop error:", err)
        return false
    }
}

(async () => {
    while (true) {
        await loop(provider, wallet)
        await sleep(90)
    }
})();