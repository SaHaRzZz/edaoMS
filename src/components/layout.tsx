import type { NextPage } from 'next'
import Link from 'next/link'
import { CogIcon, HomeIcon, PlusIcon, RefreshIcon } from '@heroicons/react/solid'
import { ChangeEventHandler, useContext, useEffect, useState } from 'react'
import { ConfigContext } from '../cardano/config'
import { NotificationCenter } from './notification'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Treasury } from '../db'
import { useRouter } from 'next/router'
import { getTreasuriesPath } from '../route'
import { encodeCardanoData, useCardanoMultiplatformLib } from '../cardano/multiplatform-lib'
import type { Cardano } from '../cardano/multiplatform-lib'
import { getBalanceByPaymentAddresses, usePaymentAddressesQuery } from '../cardano/query-api'
import type { Value } from '../cardano/query-api'
import { ADAAmount } from './currency'

const Toggle: NextPage<{
  isOn: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}> = ({ isOn, onChange }) => {
  return (
    <label className='cursor-pointer'>
      <input className='hidden peer' type='checkbox' checked={isOn} onChange={onChange} />
      <div className='flex border w-12 rounded-full border-gray-500 bg-gray-500 peer-checked:bg-green-500 peer-checked:border-green-500 peer-checked:justify-end'>
        <div className='h-6 w-6 rounded-full bg-white'></div>
      </div>
    </label>
  )
}

const Panel: NextPage<{ className?: string }> = ({ children, className }) => {
  return (
    <div className={'border-t-4 text-center border-green-700 bg-white rounded shadow overflow-hidden ' + className}>
      {children}
    </div>
  )
}

const CopyButton: NextPage<{
  disabled?: boolean
  className?: string
  getContent: () => string
  ms?: number
}> = ({ children, className, disabled, getContent, ms }) => {
  const [isCopied, setIsCopied] = useState(false)

  const clickHandle = () => {
    navigator.clipboard.writeText(getContent())
    setIsCopied(true)
  }

  useEffect(() => {
    let isMounted = true

    const timer = setTimeout(() => {
      if (isMounted && isCopied) setIsCopied(false)
    }, ms)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [isCopied, ms])

  return (
    <button className={`${className}`} disabled={disabled || isCopied} onClick={clickHandle}>
      {isCopied ? 'Copied!' : children}
    </button>
  )
}

const ShareCurrentURLButton: NextPage<{
  className?: string
}> = ({ children, className }) => {
  return (
    <CopyButton className={className} getContent={() => document.location.href} ms={500}>
      {children}
    </CopyButton>
  )
}

const BackButton: NextPage<{
  className?: string
}> = ({ children, className }) => {
  const router = useRouter()
  return     <Link href={`/`}>
  <a className={className}>
    {children}
  </a>
</Link>;
}

const NavLink: NextPage<{
  className?: string
  href: string
  onPageClassName: string
}> = ({ children, className, href, onPageClassName }) => {
  const [isOnPage, setIsOnPage] = useState(false)
  const parentPaths = href.split('/')

  useEffect(() => {
    let isMounted = true

    const currentPaths = document.location.pathname.split('/')
    const isOnPage = parentPaths.every((name, index) => name === currentPaths[index])

    if (isMounted) setIsOnPage(isOnPage)

    return () => {
      isMounted = false
    }
  }, [parentPaths])

  return (
    <Link href={href}>
      <a className={[className, isOnPage ? onPageClassName : ''].join(' ')}>
        {children}
      </a>
    </Link>
  )
}

const PrimaryBar: NextPage = () => {
  return (
    <aside className=''>
    </aside>
  )
}

const TreasuryListing: NextPage<{
  treasury: Treasury
  balance?: Value
}> = ({ treasury, balance }) => {
  const { name, script } = treasury
  const base64CBOR = encodeCardanoData(script, 'base64')
  const lovelace = balance?.lovelace
  return (
    <NavLink
      href={getTreasuriesPath(encodeURIComponent(base64CBOR))}
      onPageClassName='bg-green-700 font-semibold'
      className='block w-full p-4 truncate hover:bg-green-700'>
      <div>{name}</div>
      <div className='text-sm font-normal'>{lovelace ? <ADAAmount lovelace={lovelace} /> : <RefreshIcon className='w-4 animate-spin transform rotate-180' />}</div>
    </NavLink>
  )
}

const TreasuryList: NextPage<{
  cardano: Cardano
  treasuries: Treasury[]
}> = ({ cardano, treasuries }) => {
  const [config, _] = useContext(ConfigContext)
  const addresses = cardano && treasuries && treasuries.map((treasury) => {
    const script = cardano.lib.NativeScript.from_bytes(treasury.script)
    return cardano.getScriptAddress(script, config.isMainnet).to_bech32()
  })
  const { data } = usePaymentAddressesQuery({
    variables: { addresses },
    fetchPolicy: 'cache-first',
    pollInterval: 10000
  })
  const balanceMap = new Map<string, Value>()
  data?.paymentAddresses.forEach((paymentAddress) => {
    const address = paymentAddress.address
    const balance = getBalanceByPaymentAddresses([paymentAddress])
    balanceMap.set(address, balance)
  })
  const balances = (addresses ?? []).map((address) => balanceMap.get(address))

  return (
    <nav className='block w-full'>
      {treasuries.map((treasury, index) => <TreasuryListing key={index} treasury={treasury} balance={balances[index]} />)}
    </nav>
  )
}

const SecondaryBar: NextPage = () => {
  const treasuries = useLiveQuery(async () => db.treasuries.toArray())
  const cardano = useCardanoMultiplatformLib()

  return (
    <aside className=''>
    </aside>
  )
}

const CardanoScanLink: NextPage<{
  className?: string
  type: 'transaction'
  id: string
}> = ({ className, children, type, id }) => {
  const [config, _] = useContext(ConfigContext)
  const host = config.isMainnet ? 'https://cardanoscan.io' : 'https://testnet.cardanoscan.io'
  const href = [host, type, id].join('/')
  return <a className={`${className} mx-auto bg-primary container-fluid`} style={{alignContent: 'center'}} href={href} target='_blank' rel='noreferrer'></a>;
}

const Hero: NextPage<{ className?: string }> = ({ className, children }) => {
  return <div className={'rounded p-4 bg-green-700 text-white shadow space-y-4 ' + className}>{children}</div>;
}

const Layout: NextPage = ({ children }) => {
  const [config, _] = useContext(ConfigContext)

  return (
    <div className='flex h-screen'>
      <PrimaryBar />
      <SecondaryBar />
      <div className='w-full bg-green-100 overflow-y-auto'>
        {!config.isMainnet && <div className='p-1 bg-red-900 text-white text-center'>You are using testnet</div>}
        <div className='flex flex-row-reverse'>
          <NotificationCenter className='fixed space-y-2 w-1/4' />
        </div>
        <div className='p-2 h-screen'>
          {children}
        </div>
      </div>
    </div>
  )
}

export { Layout, Panel, Toggle, Hero, BackButton, CardanoScanLink, CopyButton, ShareCurrentURLButton }
