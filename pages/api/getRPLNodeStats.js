// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../../firebase/clientApp";

export default async function handler(req, res) {
    const db = getFirestore(app);
    const collRef = collection(db, "nodes");
    const snapshot = await getDocs(collRef);
    const nodes = snapshot.docs.map(doc => doc.data());

    res.status(200).json(nodes);
}
