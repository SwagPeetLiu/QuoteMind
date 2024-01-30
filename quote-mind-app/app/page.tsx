'use client'
import { useEffect, useState } from "react";
import axios from 'axios';


export default function Home() {

  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchHomeData = async() =>{
      try{
        const response = await axios.get(`${process.env.NEXT_PUBLIC_FLASK_URL}/home_info`);
        setData(response.data.message)
      }
      catch(e){
        console.log("Error", e)
      }
    }
    fetchHomeData()  
  }, [])

  return (
    <div>
      {data? <p>{data}</p>: <p>Loading...</p>}
    </div>
  );
}
