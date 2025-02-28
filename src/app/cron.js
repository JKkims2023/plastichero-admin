const cron =  require('node-cron');
const {getConnection} = require('../app/lib/db');
const axios = require('axios');

let isCronJobScheduled = false; // Cron 작업이 등록되었는지 추적하는 변수
let chk_first = false;

async function fetchDataFromDb() {

    try{

        const connection = await getConnection();

        const sql = `
        
            SELECT 
            
            N.node_no, 
            N.kc_kiosk_id, 
            N.wallet_idx, 
            N.mb_no, 
            N.node_name, 
            N.mining_amount, 
            N.node_type, 
            N.stop_yn, 
            N.buy_date, 
            N.reg_date, 
            N.update_date, 
            N.delete_flag,
            W.address

            FROM g5_node_list as N inner join tbl_pth_wallet_info as W on N.wallet_idx = W.idx 
            
            where N.delete_flag = 'N' and N.stop_yn = 'N';
                
        `;
    
        const [rows, fields] = await connection.execute(sql);

        const sql_base_node = `
            
            SELECT 

            NC.node_company_no,
            NC.node_name,
            NC.user_key,
            NC.wallet_idx,
            NC.mining_amount,
            W.address
             
            from g5_node_company_list as NC inner join tbl_pth_wallet_info as W on NC.wallet_idx = W.idx 
            
            where NC.delete_flag = 'N' and NC.stop_yn = 'N'
            
            order by order_idx     

        `;

        const [rows_base_node, fields_base_node] = await connection.execute(sql_base_node);
    
        connection.release(); // 연결 반환

        if(rows.length > 0){
    
            return {
                
                main_list : rows, 
                base_node_list : rows_base_node

            };
    
        }else{
    
            return {

                main_list : [], 
                base_node_list : []

            };
    
        }
    

    }catch(error){

        console.log(error);
        return [];
    
    }

}


async function updateDataFromDb_base_node(data) {

    try{

        const connection = await getConnection();

        const sql = `
        
            INSERT INTO g5_mining_history(
            node_no, 
            mining_amount,
            mining_type 
            result_key,
            round_date, 
            req_date)
            VALUES(
            ${data.node_no}, 
            ${data.mining_amount},
            'M', 
            'testkey',
            '${formatDate(new Date())}', 
            CURRENT_TIMESTAMP);
                
        `;
    
        const [rows, fields] = await connection.execute(sql);

        connection.release(); // 연결 반환

        if(rows.affectedRows == 1){
    
            return {
                
                result : 'success'

            };
    
        }else{
    
            return {

                result : 'fail'
            };
    
        }
    

    }catch(error){

        console.log(error);
        return [];
    
    }

}


async function updateDataFromDb_sub_node(data) {

    try{

        const connection = await getConnection();

        const sql = `
        
            INSERT INTO g5_mining_history(
            node_no, 
            mining_amount,
            mining_type,  
            result_key,
            round_date, 
            req_date)
            VALUES(
            ${data.node_no}, 
            ${data.mining_amount},
            ,'S' 
            'testkey',
            '${formatDate(new Date())}', 
            CURRENT_TIMESTAMP);
                
        `;
    
        const [rows, fields] = await connection.execute(sql);

        connection.release(); // 연결 반환

        if(rows.affectedRows == 1){
    
            return {
                
                result : 'success'

            };
    
        }else{
    
            return {

                result : 'fail'
            };
    
        }
    

    }catch(error){

        console.log(error);
        return [];
    
    }

}

async function callExternalApi(data) {

    try{

        const response = await axios.post("https://api.example.com/endpoint", data); // 외부 API 호출
        return response.data;

    }catch(error){

        console.log(error);
        return [];
    }
}

async function updateDbWithResults(results) {
    const { db } = await connectToDatabase();
    for (const result of results) {
        // 결과를 데이터베이스에 업데이트하는 로직을 추가하세요.
        await db.collection('yourCollection').updateOne(
            { _id: result._id }, // 조건에 맞는 문서 찾기
            { $set: { result: result } } // 업데이트할 필드
        );
    }
}

function formatDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`; // 'YYYYMMDD' 형식으로 반환

}

module.exports.startCronJob = function() {
    // 매일 오전 8시에 작업 실행

    if (!isCronJobScheduled) { // Cron 작업이 등록되지 않은 경우에만 등록
        
        console.log('Cron job scheduled');
        
        cron.schedule('45 17 * * *', async () => {

            if(chk_first){

                return;
            }else{

                chk_first = true;

            }

            console.log('Cron job called'); // Cron 작업 호출 로그 추가
            const data = await fetchDataFromDb(); // DB에서 데이터 가져오기
            
            if (data.main_list.length > 0) {

                console.log(data.main_list);  

                for(let i = 0; i < data.main_list.length; i++){

                    // 메인 노드 처리(외부 API 호출)
//                    const result = await callExternalApi(data.main_list[i]);
 //                   await updateDbWithResults(result);

                    console.log(data.main_list[i]);

                    if(true){

                        const result_main_node_query = await updateDataFromDb_base_node(data.main_list[i]);

                        if(result_main_node_query.result == 'success'){

                            // 베이스 노드 처리(외부 API 호출)
                            for(let j = 0; j < data.base_node_list.length; j++){


                                if(true){

                                    const result_sub_node_query = await updateDataFromDb_sub_node(data.base_node_list[j]);

                                    if(result_sub_node_query.result == 'success'){

                                        console.log('서브 노드 처리 성공');

                                    }else{

                                        console.log('서브 노드 처리 실패');

                                    }

                                }else{

                                }
                            }

                        }else{

                            console.log('메인 노드 처리 실패');

                        }

                    }else{


                        
                    }

                }
                
                // const results = await callExternalApi(data); // API 호출
                // await updateDbWithResults(results); // DB 업데이트
                console.log('Scheduler executed successfully');
            
            } else {
                console.log('No data found');
            }
        });

        isCronJobScheduled = true; // Cron 작업이 등록되었음을 표시
    
    } else {

        console.log('Cron job already scheduled'); // 이미 등록된 경우
    
    }
}

/*
// 서버가 시작될 때 Cron 작업을 시작합니다.
if (process.env.CRON_JOB_RUNNING !== 'true') {
    process.env.CRON_JOB_RUNNING = 'true'; // 환경 변수 설정
    module.exports.startCronJob(); // Cron 작업 시작
}
*/