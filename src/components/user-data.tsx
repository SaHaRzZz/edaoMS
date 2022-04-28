import { useLiveQuery } from 'dexie-react-hooks'
import type { NextPage } from 'next'
import { ChangeEventHandler, MouseEventHandler, useContext, useEffect, useState } from 'react'
import { ConfigContext } from '../cardano/config'
import { useCardanoMultiplatformLib } from '../cardano/multiplatform-lib'
import { db, Treasury } from '../db'

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

const DownloadButton: NextPage<{
  className?: string
  download: string
  blobParts: BlobPart[]
  options?: BlobPropertyBag
}> = ({ blobParts, options, download, className, children }) => {
  const [URI, setURI] = useState<string | undefined>()

  useEffect(() => {
    let isMounted = true

    if (blobParts && isMounted) {
      const blob = new Blob(blobParts, options)
      setURI(window.URL.createObjectURL(blob))
    }

    return () => {
      isMounted = false
    }
  }, [blobParts, options])

  if (!URI) return null

  return (
    <a
      href={URI}
      className={className}
      download={download}>
      {children}
    </a>
  )
}

const ExportUserDataButton: NextPage = () => {
  const [config, _] = useContext(ConfigContext)
  const treasuries = useLiveQuery(async () =>
    db
      .treasuries
      .toArray()
      .then((treasuries) => treasuries.map((treasury) => {
        return {
          name: treasury.name,
          description: treasury.description,
          script: Buffer.from(treasury.script).toString('base64'),
          updatedAt: treasury.updatedAt
        }
      }))
  )
  if (!treasuries) return null

  const userData: UserData = {
    isMainnet: config.isMainnet,
    version: '1',
    treasuries
  }
  const filename = `roundtable-backup.${config.isMainnet ? 'mainnet' : 'testnet'}.json`

  return (
    <div></div>
  )
}

const ImportUserData: NextPage = () => {
  const cardano = useCardanoMultiplatformLib()
  const [config, _] = useContext(ConfigContext)
  const [userDataJSON, setUserDataJSON] = useState('')

  if (!cardano) return null;

  const changeHandle: ChangeEventHandler<HTMLInputElement> = async (event) => {
    event.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target?.result)
      if (typeof text !== 'string') {
        console.error('Invalid backup file')
        return
      }
      setUserDataJSON(text)
    }
    const files = event.target.files
    if (files) {
      reader.readAsText(files[0])
    }
  }

  const clickHandle: MouseEventHandler<HTMLButtonElement> = () => {
    const userData = JSON.parse(JSON.stringify({"isMainnet":true,"version":"1","treasuries":[{"name":"Emerald DAO test","description":"multi-sig test","script":"gwMDh4IAWBxm+xPeqB8KrnQkVsZgCjl3X9376M6Wy2YrxbJQggBYHN99U6sLGlv02T1IjrIapipfzn9JBQPNmVwuet2CAFgciyp9NWVojivWyjU7cFKYk17psBBHx1VrIBeNk4IAWBxKZxIIv+0hbGkUZzY1NzYjs0UxnLJj2s+MuwiOggBYHCaBRmSrS/lPKB+/cRhKpCxWavDCKKzqnUgJs4qCAFgc6wZc/eQU/7Wu6HrLUkOVIpyX5heE1qOiZqZdQ4IAWBwVMPApBxHXgs/JuXcfPeQe4Klk9aN5Jcy9QPw3","updatedAt":"2022-04-27T17:25:19.032Z"}]}))
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

      db.treasuries.bulkAdd(treasuries)

    }
  }

  const isValid = (): boolean => {
    if (!userDataJSON) return false
    const userData = JSON.parse(userDataJSON)
    if (!userData) return false
    if (userData.isMainnet !== config.isMainnet) return false
    return true
  }

  return (
    <div>
    </div>
  )
}

export { ExportUserDataButton, ImportUserData, DownloadButton }
