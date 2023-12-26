// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import app from "../../firebase/clientApp";

// Adjust the reward based on the type of validator. 
// Probably a better way to do this, but this works for now.
// For example calling into the protocol to get the commissions.
const adjustReward = (amount, type) => {

    // //LEB8
    if(type < 15 && type >= 8) {
        // We have a 14% validator. Make sure we are returning an integer.
        const bonded = Math.floor(amount / 4);
        const borrowed =  amount - bonded;
        return bonded + Math.floor(borrowed * 0.14);
    }

    // LEB16
    if(type < 17 && type >= 16) {
        // We have a 15% validator.
        const bonded = Math.floor(amount / 2);
        const borrowed =  amount - bonded;
        return bonded + Math.floor(borrowed * 0.15);
    }

    // Solo
    return amount;
}

const formatData = (data, type) => {
    // Convert withdrawal.datetime to a date in format MM-DD-YYYY HH:MM:SS
    data.datetime = new Date(data.datetime * 1000).toLocaleString();

    // Make sure datetime does not have a comma
    data.datetime = data.datetime.replace(',', '');

    // Type needs to be rounded to the closest integer
    data.type = Math.floor(data.type);

    data.adjustedAmount = adjustReward(data.amount, data.type);

    // Propsals come in as wei, withdrwals as gwei
    if (type === 'proposal') {
        data.amount = parseInt(data.amount) / 1e18;
        data.adjustedAmount = parseInt(data.adjustedAmount) / 1e18;
    } else {
        data.amount = parseInt(data.amount) / 1e9;
        data.adjustedAmount = parseInt(data.adjustedAmount) / 1e9;
    }

    // Add our data to the array.
    return {
        "datetime": data.datetime,
        "epoch": data.epoch,
        "validator_index": data.validator_index,
        "validator_type": data.type,
        "reward_type": type,
        "node": data.node,
        "amount": data.amount,
        "adjusted_amount": data.adjustedAmount,
    };
}


export default async function handler(req, res) {
    // Read from the firebase database
    const db = getFirestore(app);
    const collRef = collection(db, process.env.REWARDS_COLLECTION);

    const rplRewards = JSON.parse(process.env.RPL_REWARDS);

    // Get from / to dates from the request
    const { startDatetime, endDatetime } = req.query;

    const q = await query(collRef);

    const rewards = [];     // Rewards are currently indexed by epoch in our database.
    const validators = {};

    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
        rewards.push({...doc.data(), id: doc.id });
    }

    // Initialize our data array for the csv.
    let data = [];
    // Add the headers
    data.push({
        "datetime": "datetime",
        "epoch": "epoch",
        "validator_index": "validator_index",
        "validator_type": "type",
        "reward_type": "reward_type",
        "node": "node",
        "amount": "amount",
        "adjusted_amount": "adjusted_amount",
    });

    // Loop through all rewards and get the validatorindex
    for (const reward of rewards) {
        // We are going to build an array that we will export as a csv.
        for(const withdrawal of reward.withdrawals) {
            if (withdrawal?.datetime && withdrawal.datetime >= startDatetime && withdrawal.datetime <= endDatetime) {
               data.push(formatData(withdrawal, 'withdrawal'));
            }
        }
    
        for (const proposal of reward.proposals) {
            if (proposal?.datetime && proposal.datetime >= startDatetime && proposal.datetime <= endDatetime) {
                data.push(formatData(proposal, 'proposal'));
            }
        }
    }
    
    // format data array as a csv include headers
    data = data.map((row) => {
        return Object.values(row).join(',');
    }).join('\n');


    // Ouput the data array as a csv
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'data.csv' + '\"');
    res.send(data);
}
