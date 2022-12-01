// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import https from 'https'
import readline from 'readline'
import {
  Account,
  Contract,
  ec,
  json,
  number,
  shortString,
  stark,
  Provider,
  uint256,
  getChecksumAddress,
} from 'starknet'
import axios from 'axios'

const aesCmac = require('node-aes-cmac').aesCmac

type Data = {
  name: string
}

const LOCK = 82
const UNLOCK = 83

// Initialize provider
const infuraEndpoint = process.env.INFURA_STARKNET_ENDPOINT
const provider = new Provider({
  rpc: {
    nodeUrl: infuraEndpoint!,
  },
})

const compiledErc721 = json.parse(
  fs.readFileSync('./pages/api/ERC721.json').toString('ascii')
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const erc721Address =
    '0x07861c4e276294a7e859ff0ae2eec0c68300ad9cbb43219db907da9bad786488'

  const erc721 = new Contract(compiledErc721.abi, erc721Address, provider)

  try {
    const tokenId = 45471
    const value = uint256.bnToUint256(tokenId)

    const hoge = await erc721.ownerOf([value.low, value.high])
    if (getChecksumAddress(number.toHex(hoge[0])) === req.query.address) {
      console.log('hege')
      await executeSesame(Number(req.query.cmd))
    }
  } catch (e) {
    console.log(e)
  }

  res.status(200).json({ name: 'John Doe' })
}

async function executeCommand(cmd: any, history: any, signature: any) {
  let base64_history = Buffer.from(history).toString('base64')
  const res = await axios({
    method: 'post',
    url: `https://app.candyhouse.co/api/sesame2/${process.env.SESAME_UUID}/cmd`,
    headers: { 'x-api-key': process.env.SESAME_API_KEY },
    data: {
      cmd: cmd,
      history: base64_history,
      sign: signature,
    },
  })
}

async function executeSesame(cmd: number) {
  try {
    let signature = generateRandomTag(process.env.SESAME_SECRET)
    let history = 'STARKNET CC INDIA 2022'
    await executeCommand(cmd, history, signature)
  } catch (error) {
    console.log(error)
  }
}

function generateRandomTag(secret: any) {
  let key = Buffer.from(secret, 'hex')
  const date = Math.floor(Date.now() / 1000)
  const dateDate = Buffer.allocUnsafe(4)
  dateDate.writeUInt32LE(date)
  const message = Buffer.from(dateDate.slice(1, 4))
  return aesCmac(key, message)
}
