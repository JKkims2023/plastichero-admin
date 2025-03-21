// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import { walletLib } from '../../../../utils/wallet';


export async function POST(request) {

  try{

    const { node_no, restore_key, to, amount } = await request.json();


    console.log('node_no : ' + node_no);
    console.log('restore_key : ' + restore_key);
    console.log('to : ' + to);
    console.log('amount : ' + amount);

    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    console.log('ip : ' + data.ip);


    const result = await walletLib.sendCoin(restore_key, to, amount);

    console.log('result : ' + result);

    if(result.error_code !== 200){

      return NextResponse.json({ 

        result: 'fail',

      });

    }else{


      return NextResponse.json({ 

        result: 'success',

      });
      
    }    
  
  }catch(error){

    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 401 });
  
  }

}