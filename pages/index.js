import { useState } from "react";


const Index = () => {

  const [contractAddress, setContractAddress] = useState('');

  const submitContractAddress = (e) => {
    e.preventDefault();
    console.log(contractAddress);

    fetch('/api/getABI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contractAddress })
    }).then(response => response.json()).then(data => {
      const abi = JSON.parse(data);

      // Filter the abi for event types
      const events = abi.filter(item => item.type === 'event');
      console.log(events);
    }
    ).catch(err => {
      console.log(err);
    });
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen">
        <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-1/3 appearance-none leading-normal" type="text" placeholder="Contract Address" onChange={(e) => setContractAddress(e.target.value)} />
        <button onClick={submitContractAddress} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Next</button>
      </div>
    </div>
  );
}

export default Index;