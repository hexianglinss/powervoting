import {
    ChainClient,
    HttpChainClient,
    HttpCachingChain,
    roundTime,
    roundAt,
    ChainInfo,
    defaultChainOptions
} from "drand-client"
import { Buffer } from "buffer"
import { createTimelockEncrypter } from "./drand/timelock-encrypter"
import { decryptAge, encryptAge } from "./age/age-encrypt-decrypt"
import { decodeArmor, encodeArmor, isProbablyArmored } from "./age/armor"
import { createTimelockDecrypter } from "./drand/timelock-decrypter"
import { defaultChainInfo, defaultChainUrl, MAINNET_CHAIN_URL, TESTNET_CHAIN_URL } from "./drand/defaults"
import { LIB_VERSION } from "./version"

export async function timelockEncrypt(
    roundNumber: number,
    payload: Buffer,
    chainClient: ChainClient
): Promise<string> {
    const timelockEncrypter = createTimelockEncrypter(chainClient, roundNumber)
    const agePayload = await encryptAge(payload, timelockEncrypter)
    return encodeArmor(agePayload)
}

export async function timelockDecrypt(
    ciphertext: string,
    chainClient: ChainClient
): Promise<Buffer> {
    const timelockDecrypter = createTimelockDecrypter(chainClient)

    let cipher = ciphertext
    if (isProbablyArmored(ciphertext)) {
        cipher = decodeArmor(cipher)
    }

    return await decryptAge(cipher, timelockDecrypter)
}

export function testnetClient(): HttpChainClient {
    const chain = new HttpCachingChain(TESTNET_CHAIN_URL, defaultChainOptions)
    return new HttpChainClient(chain, defaultChainOptions, {
        userAgent: `tlock-js-${LIB_VERSION}`
    })
}

export function mainnetClient(): HttpChainClient {
    const opts = {
        ...defaultChainOptions,
        chainVerificationParams: {
            chainHash: "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971",
            publicKey: "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a"
        }
    }
    const chain = new HttpCachingChain(MAINNET_CHAIN_URL, opts)
    return new HttpChainClient(chain, opts)
}

export {
    ChainClient,
    HttpChainClient,
    HttpCachingChain,
    ChainInfo,
    defaultChainInfo,
    defaultChainUrl,
    roundTime,
    roundAt,
    Buffer
}