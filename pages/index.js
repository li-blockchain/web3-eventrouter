import { getAuth } from "firebase/auth";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import UserButton from "../components/UserButton";
import app from "../firebase/clientApp";
import { UserProvider } from "../providers/UserProvider";

import { collection, doc, getFirestore, setDoc } from "firebase/firestore";


const Index = () => {

  const [contractAddress, setContractAddress] = useState('');
  const [events, setEvents] = useState([]);
  const [url, setURL] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [ user ] = useAuthState(getAuth(app));

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
      setEvents(events);
    }
    ).catch(err => {
      console.log(err);
    });
  }

  const createListener = (e) => {
    e.preventDefault();

    console.log("We are going to create a listener for this event");
    console.log(events[selectedEvent]);

    // Write to the database!
    const listener = {
      "contract": contractAddress,
      "event": events[selectedEvent],
      "url": url,
      "user": user.uid
    }

    const db = getFirestore(app);
    const collRef = collection(db, "listeners");

    setDoc(doc(collRef), listener).then(() => {
      console.log("Listener created");
    }
    ).catch(err => {
      console.log(err);
    }
    );
  }

  return (
    <UserProvider>
      <div className="flex justify-end">
        <UserButton />
      </div>
      <div className="grid grid-cols-3">
        <div className="flex flex-col items-center justify-center h-screen">
          <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-1/3 appearance-none leading-normal" type="text" placeholder="Contract Address" onChange={(e) => setContractAddress(e.target.value)} />
          <button onClick={submitContractAddress} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Next</button>
        </div>
        <div className="grid m-10">
          {events.length > 0 && <h1 className="font-bold text-2xl col-span-2">Events Available</h1>}
          {events.length > 0 && events.map((event, index) => {
            return (
              <div key={index} className="border-solid rounded-lg border-4 p-5 m-2">
                <input type="radio" name="event" onChange={(e) => setSelectedEvent(e.target.value)} value={index} />
                <h3 className="font-bold">{event.name}</h3>
                <p>
                  {event.inputs.map((input, index) => {
                    return (
                      <span key={index}>{input.name} - {input.type}</span>
                    )
                  })}
                </p>
              </div>
            )
          })}
        </div>
        <div>
          {events.length > 0 &&
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="font-bold text-2xl">Event Action</div>
            <p>What to do when we hear an event?</p>
            <label className="block text-grey-700 text-sm font-bold mb-2" htmlFor="url"/>
            <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-1/3 appearance-none leading-normal" type="text" placeholder="URL" onChange={(e) => setURL(e.target.value)} />
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" onClick={(e) => createListener(e)}>Start Listening</button>
          </div>
          }
        </div>
      </div>
    </UserProvider>
  );
}

export default Index;