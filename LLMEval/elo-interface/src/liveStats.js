import { useEffect } from "react";
import { collection, getDocs, query, getFirestore } from "firebase/firestore";
import { app } from "./firebase";
import * as EloEval from "./eloEval";
import * as Data from "./data.js";

const LiveStats = () => {

    /*
    const db = getFirestore(app);*/

    const grabData = async () => {
        /*
        const collectionRef = collection(db, 'test')
        const querySnapshot = await getDocs(query(collectionRef))
        return querySnapshot*/
        console.log(Data.data)
        return Data.data
    }

    useEffect(() => {
        grabData().then((querySnapshot) => {
            
            querySnapshot.forEach((doc) => {
                //console.log(doc.data())
                //console.log(doc)
            })

            console.log(EloEval.sortTime(querySnapshot.sort((a, b) => {return 0.5-Math.random()})))
        })
    
        }, [])

    return (
        <div>
            <h1>Live Stats</h1>
        </div>
    )
}

export default LiveStats;