// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import app from "../../firebase/clientApp";

export default async function handler(req, res) {
    // Read from the firebase database
    const db = getFirestore(app);
    const collRef = collection(db, process.env.REWARDS_COLLECTION);

    // Get from / to dates from the request
    const { startDatetime, endDatetime } = req.query;

    const q = await query(collRef);

    const rewards = [];     // Rewards are currently indexed by epoch in our database.
    const validators = {};

    getDocs(q).then((querySnapshot) => {

        querySnapshot.forEach((doc) => {
            // spread doc.data with doc.id
            rewards.push({...doc.data(), id: doc.id });
        });

        // Loop through all rewards and get the validatorindex
        rewards.forEach((reward) => {
            // Loop through all withdrawals
            reward.withdrawals.forEach((withdrawal) => {            
                if(withdrawal.datetime >= startDatetime && withdrawal.datetime <= endDatetime) {
                    // Adding a validator and withdrawals
                    if (!validators[withdrawal.validator_index]) {
                        validators[withdrawal.validator_index] = {};
                        validators[withdrawal.validator_index]['withdrawals'] = withdrawal.amount;
                        validators[withdrawal.validator_index]['type'] = withdrawal.type;
                        validators[withdrawal.validator_index]['node'] = withdrawal.node;
                        validators[withdrawal.validator_index]['proposals'] = 0;
                    } else {
                        validators[withdrawal.validator_index]['withdrawals'] += withdrawal.amount;
                    }
                }
            });

            reward.proposals.forEach(data => {
                if(data.datetime >= startDatetime && data.datetime <= endDatetime) {
                    // Adding a validator and withdrawals
                    if (!validators[data.validator_index]) {
                        validators[data.validator_index] = {};
                        validators[data.validator_index]['withdrawals'] = 0;
                        validators[data.validator_index]['proposals'] = parseInt(data.amount);
                        validators[data.validator_index]['type'] = data.type; 
                        validators[data.validator_index]['node'] = data.node; 
                    } else {
                        validators[data.validator_index]['proposals'] += parseInt(data.amount);
                    }
                }
            });
        });
        res.status(200).json(validators);
    });

}