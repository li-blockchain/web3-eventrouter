// Component to list users listeners.

import { useState, useEffect, useRef } from 'react';
import app from '../firebase/clientApp';
import { UserProvider } from '../providers/UserProvider';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import AppContainer from '../components/AppContainer';
import Datepicker from "react-tailwindcss-datepicker";
import { DownloadTableExcel } from 'react-export-table-to-excel';

import {
    BellIcon, ChartBarIcon, PencilSquareIcon, PlusSmallIcon, TrashIcon,
  } from '@heroicons/react/24/outline'
import { ethers } from 'ethers';

const Validators = () => {
    const [ user ] = useAuthState(getAuth(app));

    // Read all listeners from the database
    const [validators, setValidators] = useState([]);
    const [totalWithdrawals, setTotalWithdrawals] = useState(0);
    const [totalProposals, setTotalProposals] = useState(0);
    const [totalRPL, setTotalRPL] = useState(0);
    const [totalRewards, setTotalRewards] = useState(0);
    const [isLoading, setLoading] = useState(true);

    const tableRef = useRef(null);

    const secondaryNavigation = [
        { name: 'Current Cycle', href: '#', current: true },
        { name: 'Last Checkpoint', href: '#', current: false },
        { name: 'All-time', href: '#', current: false },
    ]

    const stats = [
        { name: 'Withdrawals', value: totalWithdrawals, change: '', changeType: 'positive' },
        { name: 'Block Rewards', value: totalProposals, change: '', changeType: 'negative' },
        { name: 'RPL Rewards', value: totalRPL, change: '-', changeType: 'positive' },
        { name: 'Total Rewards', value: totalRewards, change: '', changeType: 'negative' },
    ]

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [dateRange, setDateRange] = useState({ 
        startDate: thirtyDaysAgo, 
        endDate: new Date()
    }); 

    const handleDateChange = (newDateRange) => {
        const startDate = new Date(newDateRange.startDate);
        const endDate = new Date(newDateRange.endDate);
    
        // Adjust the selected dates to the local time zone
        const timezoneOffset = startDate.getTimezoneOffset() * 60000;
        const localStartDate = new Date(startDate.getTime() + timezoneOffset);
        const localEndDate = new Date(endDate.getTime() + timezoneOffset);
    
        setDateRange({
            startDate: localStartDate,
            endDate: localEndDate
        });
    };
    

    useEffect(() => {
        if(user) {
            async function fetchData() {
                const localStartDate = new Date(dateRange.startDate.getTime() - dateRange.startDate.getTimezoneOffset() * 60000);
                const localEndDate = new Date(dateRange.endDate.getTime() - dateRange.endDate.getTimezoneOffset() * 60000);
    
                // Convert dateRange to Unix timestamp adjusted to local time zone
                const startDatetime = Math.floor(localStartDate.getTime() / 1000);
                const endDatetime = Math.floor(localEndDate.getTime() / 1000) + 86399;

                const url = `/api/getValidators?startDatetime=${startDatetime}&endDatetime=${endDatetime}`;

                console.log("url:", url);

                 // Call API endpoint at /api/getValidators to get all validators.
                const validators = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                return await validators.json();
            }

            fetchData().then(data => {
                var validatorsArray = Object.entries(data.validators).map(([validatorIndex, validator]) => ({
                    validatorIndex,
                    ...validator
                }));

                // Loop through validators and get the total rewards
                let totalWithdrawals = 0;
                let totalProposals = 0;
                validatorsArray.forEach(validator => {
                    // Get the total rewards for this validator
                    totalWithdrawals += validator?.withdrawals;
                    if(validator?.proposals) {
                        totalProposals += validator.proposals;
                    }

                });

                totalWithdrawals = ethers.formatUnits(totalWithdrawals,9);
                totalProposals = ethers.formatUnits(totalProposals.toString(),18);

                setTotalWithdrawals("Ξ " + parseFloat(totalWithdrawals).toFixed(4));
                setTotalProposals("Ξ " + parseFloat(totalProposals).toFixed(4));
                setTotalRewards("Ξ " + (parseFloat(totalWithdrawals) + parseFloat(totalProposals)).toFixed(4))


                setValidators(validatorsArray);
                setTotalRPL(parseFloat(data.rpl).toFixed(4));
                setLoading(false);
            });
           
        }

    }, [user, dateRange]);

    

    // Prevent flast of app. Must be a better way.
    if(!user) {
        return(<UserProvider></UserProvider>);
    }

    return (
        <UserProvider>
            <AppContainer>
            <div className="m-10 bg-white rounded-md p-10 shadow-md">
                <div>
                    <h2 className='text-3xl py-5 flex'>Validator Performance<ChartBarIcon className='h-6 ml-2 mt-2 text-slate-800'></ChartBarIcon></h2>
                    {/* Secondary navigation */}
                    <header className="pb-4 pt-6 sm:pb-6">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
                        <h1 className="text-base font-semibold leading-7 text-gray-900">Rewards by date:</h1>
                        <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-gray-200 sm:pl-6 sm:leading-7">
                        <Datepicker
                            primaryColor={"purple"}  
                            value={dateRange} 
                            onChange={handleDateChange} 
                            displayFormat={"MM/DD/YYYY"} 
                        /> 
                        </div>
                        </div>
                       
                    </header>
                    <div className="relative isolate overflow-hidden pt-16">
                     {/* Stats */}
                        <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
                        <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
                        {stats.map((stat, statIdx) => (
                            <div
                            key={stat.name}
                            className={classNames(
                                statIdx % 2 === 1 ? 'sm:border-l' : statIdx === 2 ? 'lg:border-l' : '',
                                'flex items-baseline flex-wrap justify-between gap-y-2 gap-x-4 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8'
                            )}
                            >
                            <dt className="text-sm font-medium leading-6 text-gray-500">{stat.name}</dt>
                            <dd
                                className={classNames(
                                stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700',
                                'text-xs font-medium'
                                )}
                            >
                                {stat.change}
                            </dd>
                            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
                                {stat.value}
                            </dd>
                            </div>
                        ))}
                        </dl>
                    </div>
                    <div
            className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
            aria-hidden="true"
          >
            <div
              className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#d333ff] to-[#e79afc]"
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
            />
          </div>
          </div>
                    
                    
                    {/* Loop through all validators and display their performance */}
                    <div className="flex flex-row justify-between">
                    <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none pt-10 pb-5">Validator Breakdown</h2>
                    <DownloadTableExcel
                        filename="validator_rewards"
                        sheet="rewards"
                        currentTableRef={tableRef.current}>
                        <button className="mx-auto max-w-2xl text-base leading-6 text-gray-900 lg:mx-0 lg:max-w-none mt-5 p-2 border-solid rounded-md border-2"> Export excel </button>
                    </DownloadTableExcel>
                    </div>
                    <table className="min-w-full divide-y divide-gray-300" ref={tableRef}>
                        <thead>
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Validator #</th>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Type</th>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Node</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Withdrawals</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proposals</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {validators.map((validator) => (
                                <tr key={validator.validatorIndex}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"><a href={`https://beaconcha.in/validator/${validator.validatorIndex}`}>{validator.validatorIndex}</a></td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">Ξ {validator.type}</td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{validator.node}</td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">Ξ {parseFloat(ethers.formatUnits(validator.withdrawals,9)).toFixed(4)}</td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{validator?.proposals && "Ξ " + parseFloat(ethers.formatUnits(validator?.proposals.toString(), 18)).toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </AppContainer>
        </UserProvider>
    )
}

export default Validators;

