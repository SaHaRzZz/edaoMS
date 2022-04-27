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
          <p className='btn btn-primary'><Link href='/treasuries/ggGCggBYHGb7E96oHwqudCRWxmAKOXdf3fvozpbLZivFslCCAFgc331TqwsaW%2FTZPUiOshqmKl%2FOf0kFA82ZXC563Q%3D%3D'><a className='text-green-700'>Click here to enter</a></Link></p>
          <div className='justify-content-between container'>
            <div className='row'>
              <WalletInfo className='flex border rounded p-2 space-x-2 items-center col m-auto col shadow sWalletInfo' name='nami' src='/nami.svg'>Nami Wallet</WalletInfo>
              <WalletInfo className='flex border rounded p-2 space-x-2 items-center col m-auto col shadow sWalletInfo' name='eternl' src='/eternl.png'>Eternl/cc Wallet</WalletInfo>
              <WalletInfo className='flex border rounded p-2 space-x-2 items-center col m-auto col shadow sWalletInfo' name='gero' src='https://gerowallet.io/assets/img/logo2.ico'>Gero Wallet</WalletInfo>
            </div>
          </div>
          <p>We have an active and welcoming community. If you have any issues or questions, feel free to reach out to us via <a className='text-green-700' target='_blank' rel='noreferrer' href='https://discord.gg/SDnm4GzY'>Discord</a>.</p>
        </Panel>
      </div>
    </Layout>
  )
}

export default Home
