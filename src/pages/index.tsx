import type { NextPage } from 'next'
import Link from 'next/link'
import { ChangeEventHandler, MouseEventHandler, useContext, useEffect, useState } from 'react'
import { ConfigContext } from '../cardano/config'

import { Layout, Panel } from '../components/layout'
import { WalletInfo } from '../components/transaction'
import { db, Treasury } from '../db'
import { useCardanoMultiplatformLib } from '../cardano/multiplatform-lib'

type UserData = {
  isMainnet: boolean
  version: string
  treasuries: {
    name: string
    description: string
    script: string
    updatedAt: Date
  }[]
}

const Home: NextPage = () => {
const [config, _] = useContext(ConfigContext)

  const cardano = useCardanoMultiplatformLib()
  if (!cardano) return null;

  const clickHandle = () => {
    const userData = JSON.parse(JSON.stringify({"isMainnet":true,"version":"1","treasuries":[{"name":"etseat","description":"etataet","script":"ggGCggBYHGb7E96oHwqudCRWxmAKOXdf3fvozpbLZivFslCCAFgc331TqwsaW/TZPUiOshqmKl/Of0kFA82ZXC563Q==","updatedAt":"2022-04-27T11:11:18.867Z"}]}))
  if (userData.isMainnet !== config.isMainnet) return;
    importUserData(userData)
  }

  const importUserData = (userData: UserData) => {
    const version = userData.version

    if (version === '1') {
      const treasuries: Treasury[] = userData.treasuries.map((treasury) => {
        const script = Buffer.from(treasury.script, 'base64')
        const nativeScript = cardano.lib.NativeScript.from_bytes(script)
        const hash = cardano.hashScript(nativeScript).to_hex()
        return {
          hash,
          name: treasury.name,
          description: treasury.description,
          script,
          updatedAt: treasury.updatedAt
        }
      })

      db.treasuries.bulkAdd(treasuries).catch(e => {
        console.log('SaHaRzZz wishes you a great day.');
        
      })
      
    }
  }
    
  clickHandle();
  return (
    <Layout>
      <div className='space-y-2'>
        <Panel className='p-4 space-y-2 text-center'>
          <h1 className='text-lg font-semibold'>Emerald DAO treasury</h1>
          <p>Welcome to the Emerald DAO multi-signature wallet!</p>
          <p>This multi-sig wallet is based on the incredible work of ADAO!</p>
          <div>
            <Link href='/treasuries/gwMGjIIAWBzGtZiKeVGGaIQ3gR9ol1MIdWf1Upnj1vH8GcInggBYHIqqFSyn5RB9429cYjxAK%2BcQ8P5M5cSwAFPjQuKCAFgcfeZ41JAbmqSadGTNhGsPj0UNGOLyBsHuqG%2BXmoIAWBx8LOcp5bxea5qdqdZnruojKQerWw4mMdE9uxGjggBYHIxE%2ByD3YwDwX9CP5qpWpqEVDWEzQoOLU45RpAeCAFgcpi6A9ZY5tD70%2FQnVt5mfX5thSr5R6Ca2uDKkR4IAWByNPZwUWNc6%2FJUoDKJEqasWgTrSH6KJ4M8JdkXBggBYHFWosetdwAtKDiRA745KjIfUiIJHB8RrZBkSgeyCAFgciyp9NWVojivWyjU7cFKYk17psBBHx1VrIBeNk4IAWBxh5DJ%2BdJepaYxeiWkSZOka2VXKeyVZtvRV2UrMggBYHGy4LJ1uAMNTdfSfUXRscX66E225ykFkvQgqH1CCAFgcZvsT3qgfCq50JFbGYAo5d1%2Fd%2B%2BjOlstmK8WyUA%3D%3D'>
              <button className='py-4 border text-white bg-green-700 rounded createTx'>Click here to enter</button>
            </Link>
            </div>
          <div className=''>
            <div className='walletOrder'>
              <WalletInfo className='border rounded p-2 space-x-2 items-center mx-auto shadow sWalletInfo' name='nami' src='/nami.svg'>Nami Wallet</WalletInfo>
              <WalletInfo className='border rounded p-2 space-x-2 items-center mx-auto shadow sWalletInfo' name='eternl' src='/eternl.png'>Eternl/cc Wallet</WalletInfo>
              <WalletInfo className='border rounded p-2 space-x-2 items-center mx-auto shadow sWalletInfo' name='gero' src='https://gerowallet.io/assets/img/logo2.ico'>Gero Wallet</WalletInfo>
            </div>
          </div>
          <p>We have an active and welcoming community. If you have any issues or questions, feel free to reach out to us via <a className='text-green-700' target='_blank' rel='noreferrer' href='https://discord.gg/A2bNwN5PQq'>Discord</a>.</p>
        </Panel>
      </div>
    </Layout>
  )
}

export default Home
