import React, { useState } from 'react';
import AppContainer from '../components/AppContainer';
import { UserProvider } from '../providers/UserProvider';
import { WagmiProvider } from 'wagmi'
import { config } from '../providers/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NodeSummary from '../components/rpl/NodeSummary'
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

const queryClient = new QueryClient()

function Balances() {

  return (
    <UserProvider>
      <AppContainer>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
          <div className="m-10 bg-white rounded-md p-10 shadow-md">
          <h2 className='text-3xl py-5 flex'>Rocketpool Balances<RocketLaunchIcon className='h-6 ml-2 mt-2 text-slate-800'/></h2>
            <div>
            <p className='pb-5'>Below are the balances for your Rocketpool node addresses and some key stats regarding RPL rewards. </p>
              <NodeSummary nodeId='0x84ba027280cC6cc1e592a01270c5f21A494F46Cb' />
              <NodeSummary nodeId='0x665dd495742e25BFd5778E40d44A8C70303f7CEe' />
           </div>
          </div>
          </QueryClientProvider>
        </WagmiProvider>
      </AppContainer>
    </UserProvider>

  );
}

export default Balances;

