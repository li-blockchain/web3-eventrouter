import { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import AddressDisplay from "../AddressDisplay";
import { formatEther } from "viem";

const NodeSummary = ({ nodeId }) => {
    const [data, setData] = useState(null);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/getRPLNodeStats');
            const nodes = await response.json();
            const nodeData = nodes.find(node => node.nodeAddress === nodeId);
            setData(nodeData);
        };

        fetchData();
    }, [nodeId]);

    useEffect(() => {
        if (data) {
            setStats([
                { name: 'Minipool Count', value: data.minipools.length.toString() },
                { name: 'Minipool Balance', value: data.totalCommissionedBalance ? formatAndRoundEther(data.totalCommissionedBalance) : <ScaleLoader /> },
                { name: 'Fee Distributor Balance', value: data.feeDistributorBalance ? formatAndRoundEther(data.feeDistributorBalance) : <ScaleLoader /> },
                { name: 'RPL Staked', value: data.rplStake ? formatAndRoundEther(data.rplStake) : <ScaleLoader /> },
                { name: 'RPL Effective Staked', value: data.effectiveRplStake !== undefined ? formatAndRoundEther(data.effectiveRplStake) : <ScaleLoader /> },
                { name: 'Additional RPL Needed', value: data.additionalRplNeeded ? formatAndRoundEther(data.additionalRplNeeded) : <ScaleLoader /> },
            ]);
        }
    }, [data]);

    const formatAndRoundEther = (balance) => {
        const ether = formatEther(balance);
        const roundedEther = Math.round(ether * 10000) / 10000;
        return roundedEther.toFixed(4);
    };

    return (
        <>
            <h2 className="address-wrapper"><AddressDisplay address={nodeId} label="Node Address" /></h2>
            <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
                    >
                        <dt className="text-sm font-medium leading-6 text-gray-500">{stat.name}</dt>
                        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
                            {stat.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </>
    );
}

export default NodeSummary;