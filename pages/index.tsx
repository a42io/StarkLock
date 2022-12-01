import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useCallback } from 'react'
import { connect, IStarknetWindowObject } from '@argent/get-starknet'
import { ec, getChecksumAddress } from 'starknet'
import Button from '@mui/material/Button'

export default function Home() {
  const [stark, setStark] = useState<IStarknetWindowObject | undefined>()

  const handleConnect = useCallback(async () => {
    const stk = await connect()
    if (!stk) {
      throw Error(
        'User rejected wallet selection or silent connect found nothing'
      )
      return
    }

    // (optional) connect the wallet
    await stk.enable()
    if (!stk) {
      return
    }
    setStark(stk)

    // Check if connection was successful
    if (stk.isConnected) {
      // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kinds of requests through the user's wallet contract.
      console.log(stk)
      console.log(stk.provider.chainId)
    } else {
      // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
      console.log('not connected')
    }
  }, [])

  const handleSign = useCallback(async () => {
    if (!stark) return

    const typedMessage = {
      domain: {
        name: 'starklock',
        chainId: stark.provider.chainId,
        version: '0.0.1',
      },
      types: {
        StarkNetDomain: [
          { name: 'name', type: 'felt' },
          { name: 'chainId', type: 'felt' },
          { name: 'version', type: 'felt' },
        ],
        Message: [{ name: 'message', type: 'felt' }],
      },
      primaryType: 'Message',
      message: {
        message: 'unlock with starklock',
      },
    }

    const res = await stark.account.signMessage(typedMessage)

    const isVerified = await stark.account.verifyMessage(typedMessage, res)

    console.log(isVerified)
    if (isVerified) {
      const res = await fetch(
        `/api/hello?cmd=${83}&address=${getChecksumAddress(
          stark.account.address
        )}`
      )
      console.log(res)
    }
  }, [stark])

  return (
    <div className={styles.container}>
      <Head>
        <title>Starklock</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>
          Prove you have the <a href="https://mintsquare.io/asset/starknet/0x07861c4e276294a7e859ff0ae2eec0c68300ad9cbb43219db907da9bad786488/45471" target="_blank" rel="noreferrer">NFT</a> to unlock!
        </p>
        <Image
          src="/starknetcc.png"
          height={300}
          width={400}
          alt="StarknetCC"
        >
        </Image>

        <Button sx={{mt:3}} variant="outlined" onClick={handleConnect} >
          Connect Wallet
        </Button>

        <Button sx={{mt:3}} variant="outlined" onClick={handleSign}>
          Sign and Unlock
        </Button>

      </main>
    </div>
  )
}
