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

    // Loop through all rewards and get the validatorindex
    for (const reward of rewards) {
        // Loop through all withdrawals
        for (const withdrawal of reward.withdrawals) {
            if (withdrawal.datetime >= startDatetime && withdrawal.datetime <= endDatetime) {
                // Adding a validator and withdrawals
                if (!validators[withdrawal.validator_index]) {
                    validators[withdrawal.validator_index] = {};
                    validators[withdrawal.validator_index]['withdrawals'] = adjustReward(withdrawal.amount, withdrawal.type);
                    validators[withdrawal.validator_index]['type'] = Math.floor(withdrawal.type);
                    validators[withdrawal.validator_index]['node'] = withdrawal.node;
                    validators[withdrawal.validator_index]['proposals'] = 0;
                } else {
                    validators[withdrawal.validator_index]['withdrawals'] += adjustReward(withdrawal.amount, withdrawal.type);
                }
            }
        }

        for (const data of reward.proposals) {
            if (data.datetime >= startDatetime && data.datetime <= endDatetime) {
                // Adding a validator and withdrawals
                if (!validators[data.validator_index]) {
                    validators[data.validator_index] = {};
                    validators[data.validator_index]['withdrawals'] = 0;
                    validators[data.validator_index]['proposals'] = adjustReward(parseInt(data.amount), data.type);
                    validators[data.validator_index]['type'] = Math.floor(data.type); 
                    validators[data.validator_index]['node'] = data.node; 
                } else {
                    validators[data.validator_index]['proposals'] += adjustReward(parseInt(data.amount), data.type);
                }
            }
        }
    }

    // Lets filter RPL rewards if within the date range.
    let rplTotal = 0;
    for (const rplReward of rplRewards) {
        // Convert rplReward.date to unix timestamp
        rplReward.date = new Date(rplReward.date).getTime() / 1000;

        if (rplReward.date >= startDatetime && rplReward.date <= endDatetime) {
            console.log("Adding RPL reward");
            rplTotal += rplReward.value;
        }
    }
    

    res.status(200).json({"validators": validators, "rpl": rplTotal});
}
