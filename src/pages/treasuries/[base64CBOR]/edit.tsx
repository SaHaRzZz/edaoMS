import { NextPage } from 'next'
import { NextRouter, useRouter } from 'next/router'
import { Cardano, getResult, useCardanoMultiplatformLib } from '../../../cardano/multiplatform-lib'
import { BackButton, Hero, Layout, Panel } from '../../../components/layout'
import { ErrorMessage, Loading } from '../../../components/status'
import type { NativeScript } from '@dcspark/cardano-multiplatform-lib-browser'
import { DeleteTreasuryButton, NativeScriptViewer, SaveTreasuryButton } from '../../../components/transaction'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db'
import { useEffect, useState } from 'react'

const EditTreasury: NextPage<{
  cardano: Cardano
  router: NextRouter
  script: NativeScript
}> = ({ cardano, script }) => {
  const hash = cardano.hashScript(script)
  const treasury = useLiveQuery(async () => db.treasuries.get(hash.to_hex()), [script])
  const name = 'Emerald DAO';
  const description = 'This is the official multi-signature wallet of the Emerald DAO';

  useEffect(() => {
    let isMounted = true

    return () => {
      isMounted = false
    }
  }, [treasury])

  return (
    <Panel>
      <footer className='flex justify-between p-4 bg-gray-100'>
        <div className='space-x-2 createTx'>
          <SaveTreasuryButton
            cardano={cardano}
            className='px-4 py-2 bg-green-700 text-white rounded createTx'
            name={name}
            description={description}
            script={script}>
            I understand
          </SaveTreasuryButton>
        </div>
      </footer>
    </Panel>
  )
}

const GetTreasury: NextPage = () => {
  const router = useRouter()
  const { base64CBOR } = router.query
  const cardano = useCardanoMultiplatformLib()

  if (!cardano) return <Loading />;
  if (typeof base64CBOR !== 'string') return <ErrorMessage>Invalid URL</ErrorMessage>;
  const parseResult = getResult(() => cardano.lib.NativeScript.from_bytes(Buffer.from(base64CBOR, 'base64')))
  if (!parseResult.isOk) return <ErrorMessage>Invalid script</ErrorMessage>;
  const script = parseResult.data

  return (
    <Layout>
      <div className='space-y-2'>
        <Hero className='text-center'>
          <h1 className='font-semibold text-lg'>A bit of info before we begin</h1>
          <p>This multi-signature wallet is the basis for decentralization for the Emerald DAO.</p>
          <p>Each deciding member has 1 vote for deciding on approving a transaction.</p>
          <p>Here you can propose whatever transaction you think is beneficial for the DAO, convince the DAO to pass the vote by explaining and sharing the proposal link, and get it approved!</p>
        </Hero>
        <Panel>
          <NativeScriptViewer className='p-4 space-y-2' cardano={cardano} script={script} />
        </Panel>
        <EditTreasury cardano={cardano} router={router} script={script} />
      </div>
    </Layout>
  )
}

export default GetTreasury
