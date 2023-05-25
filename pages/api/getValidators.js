// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import app from "../../firebase/clientApp";

export default function handler(req, res) {
    // Read from the firebase database
    const db = getFirestore(app);
    const collRef = collection(db, "rewards");
    const q = query(collRef);

    getDocs(q).then((querySnapshot) => {
        const rewards = [];     // Rewards are currently indexed by epoch in our database.
        const validators = {};
        querySnapshot.forEach((doc) => {
            // spread doc.data with doc.id
            rewards.push({...doc.data(), id: doc.id });
        });

        // Loop through all rewards and get the validatorindex
        rewards.forEach(reward => {
            // Loop through all withdrawals
            reward.withdrawals.forEach(withdrawal => {
                // Loop through all data
                withdrawal.values.data.forEach(data => {
                    // Adding a validator and withdrawals
                    if (!validators[data.validatorindex]) {
                        validators[data.validatorindex] = {};
                        validators[data.validatorindex]['withdrawals'] = data.amount;
                    } else {
                        validators[data.validatorindex]['withdrawals'] += data.amount;
                    }
                });
            });

            reward.mev_data.forEach(m => {
                m.values.forEach(mev => {
                    // @TODO: We need to restructure the extracted data so MEV is included in the prosopsal object.
                    // @TODO: We need to support multiple blocks in the same epoch.
                    const proposer = reward.proposals[0].values.data[0].proposer;
                    validators[proposer]['proposed'] = parseInt(mev.value);
                }); 
            });
        });
        // res.status(200).json(rewards[0].withdrawals[0].values.data[0]);
        // res.status(200).json(rewards[0].proposals);
        // res.status(200).json(rewards[0].mev_data);

        res.status(200).json(validators);
    });
    
}