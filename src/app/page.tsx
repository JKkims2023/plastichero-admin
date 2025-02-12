
import React from "react";
import Image from "next/image";


export default function Home() {

  return (

    <div style={{flex:1, display:'flex', flexDirection:'row', width:'100%', height:'100vh', backgroundColor:'black'}}>

      <div>
        <h1>Welcome to My Blog</h1>
        <p>This is the home page.</p>
      </div>
   
    </div>
  );
}
