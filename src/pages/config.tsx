import { NextPage } from "next";
import { Layout, Panel } from '../components/layout'
import { useContext } from "react";
import { ConfigContext } from "../cardano/config";
import { ExportUserDataButton, ImportUserData } from '../components/user-data'
import Link from 'next/link'

const Configure: NextPage = () => {
  const [config, _] = useContext(ConfigContext)

  return (
    <Layout>
      <Panel className='p-4 space-y-2'>
        <p className='space-x-2'>
          <span>Network:</span>
          <span>{config.isMainnet ? 'Mainnet' : 'Testnet'}</span>
        </p>
        <p className='space-x-2'>
          <span>Submit API:</span>
          <span>{config.submitAPI}</span>
        </p>
      </Panel>
        <Link href='/'>
          <a className='hover:bg-sky-700'>
            <button className='p-2 rounded text-white bg-green-700 border createTx my-1' >Home</button>
          </a>
        </Link>
    </Layout>
  )
}

export default Configure
