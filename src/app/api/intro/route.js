// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';


export async function POST(request) {

  try{

    const { fromDate } = await request.json();

    const connection = await getConnection();

    const sql_mining = `
      
      SELECT 

        (select count(kc_no) from g5_kiosk) as node_count, 
        (
        select count(K.kc_no) from g5_kiosk as K inner join tbl_pth_wallet_info as W ON
        K.wallet_idx = W.idx  where K.wallet_idx <> -1 and (W.new_address is not null && W.new_address <> '')
        ) as run_count,
        (
        select count(K.kc_no) from g5_kiosk as K inner join tbl_pth_wallet_info as W ON
        K.wallet_idx = W.idx  where K.wallet_idx = -1 or (W.new_address is  null or W.new_address = '')
        ) as stop_count,
        IF((select sum(mining_amount) from g5_mining_history where mainnet_request_status = 'S' and done_yn = 'Y') is null, 0, (select sum(mining_amount) from g5_mining_history where mainnet_request_status = 'S' and done_yn = 'Y')) as mining_amount,
        IF((select count(node_no) from g5_mining_history where mainnet_request_status = 'S' and done_yn = 'Y') is null, 0, (select count(node_no) from g5_mining_history where mainnet_request_status = 'S' and done_yn = 'Y')) as mining_count

    `;


    const [rows_mining, fields_mining] = await connection.execute(sql_mining);

    const sql_company_node = `
      
      SELECT 

        node_company_no,
        node_name,
        user_key,
        wallet_no,
        wallet_idx,
        mining_amount,
        stop_yn,
        reg_date,
        order_idx,
        delete_flag

      from g5_node_company_list where stop_yn = 'N' order by order_idx 
        
    `;

    const [rows_company_node, fields_company_node] = await connection.execute(sql_company_node);

    const sql_round_summary = `
      

      SELECT  

      if((select sum(mining_amount) from g5_mining_history where tx_hash is not null and mainnet_request_status = 'S') is null, 0, (select sum(mining_amount) from g5_mining_history where tx_hash is not null and mainnet_request_status = 'S')) as successAmount, 
      if((select count(node_no) from g5_mining_history where tx_hash is not null and mainnet_request_status = 'S') is null, 0, (select count(node_no) from g5_mining_history where tx_hash is not null and mainnet_request_status = 'S')) as successCount



        
    `;

    const [rows_round_summary, fields_round_summary] = await connection.execute(sql_round_summary);

    const sql_done_schedule = `
      
      SELECT  

      schedule_no, 
      date_format(start_date, '%Y-%m-%d %H:%i:%s') as start_date, 
      date_format(done_date, '%Y-%m-%d %H:%i:%s') as done_date, 
      scheduled_yn,
      spreaded_yn

      from g5_mining_batch_schedule

      where round_date = '${fromDate.toString().replace(/-/g, '')}'
        
    `;

    let result_done_schedule = {

      schedule_no : -1,
      start_date : '',
      done_date : '',
      success_yn : 'N',

    };


    const [rows_done_schedule, fields_done_schedule] = await connection.execute(sql_done_schedule);


    if(rows_done_schedule.length > 0){

      result_done_schedule = {

        schedule_no : rows_done_schedule[0].schedule_no,
        start_date : rows_done_schedule[0].start_date,
        done_date : rows_done_schedule[0].done_date,
        success_yn : rows_done_schedule[0].scheduled_yn,
        spreaded_yn : rows_done_schedule[0].spreaded_yn,
      };

    }

    const sql_done_spread = `
      
      SELECT  

      spread_no, 
      date_format(done_date, '%Y-%m-%d %H:%i:%s') as done_date, 
      result_yn

      from g5_mining_spread_result

      where round_date = '${fromDate.toString().replace(/-/g, '')}'
        
    `;

    let result_done_spread = {

      spread_no : -1,
      done_date : '',
      result_yn : 'N',
      spreaded_yn : 'N',
    };


    const [rows_done_spread, fields_done_spread] = await connection.execute(sql_done_spread);


    if(rows_done_spread.length > 0){

      result_done_spread = {

        spread_no : rows_done_spread[0].spread_no,
        done_date : rows_done_spread[0].done_date,
        result_yn : rows_done_spread[0].result_yn,

      };

    }


    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : [],//rows,
        result_summary : [],//rows_summary,
        result_node_summary : rows_mining[0],// rows_mining[0],
        result_company_node : rows_company_node,
        result_round_summary : rows_round_summary[0],
        result_done_schedule : result_done_schedule,
        result_done_spread : result_done_spread,

      });


      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}