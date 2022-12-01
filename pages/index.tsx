import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useCallback } from 'react'
import { connect, IStarknetWindowObject } from '@argent/get-starknet'
import { ec, getChecksumAddress } from 'starknet'

export default function Home() {
  const [stark, setStark] = useState<IStarknetWindowObject | undefined>()

  const handleConnect = useCallback(async () => {
    const stk = await connect({ showList: true })
    if (!stk) {
      throw Error(
        'User rejected wallet selection or silent connect found nothing'
      )
      return
    }

    // (optional) connect the wallet
    await stk.enable()
    if (!stk) {
      console.log('here error')
      return
    }
    console.log('here set')
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
        message: 'a42',
      },
    }

    const res = await stark.account.signMessage(typedMessage)
    console.log(res)

    const isVerified = await stark.account.verifyMessage(typedMessage, res)
    console.log(isVerified)

    // ugokanai
    // console.log(await stark.account.getNonce())

    console.log(stark.account.address)
    console.log(getChecksumAddress(stark.account.address))

    // const ho = ec.getKeyPairFromPublicKey(are)
    // console.log('here ')
    // console.log(ho)
    // const a = ec.getStarkKey(ho)
    // console.log(a)

    // console.log(are)

    stark.account.execute
  }, [stark])

  return (
    <div className={styles.container}>
      <Head>
        <title>Starklock</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title} onClick={handleSign}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description} onClick={handleConnect}>
          Get started by connecting{' '}
          <code className={styles.code}>your wallet!</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
