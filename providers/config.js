import { http, createConfig } from 'wagmi'
import { mainnet, holesky } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, holesky],
  transports: {
    [mainnet.id]: http('http://libc-prod2:8545'),
    [holesky.id]: http(),
  },
})