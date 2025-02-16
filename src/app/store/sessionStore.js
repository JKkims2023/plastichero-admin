// store/authStore.js

// import { getConnection } from '../lib/db';

const sessionStore = async(user_id) => {
 
  try{

    console.log('jk sessionStore');
    console.log('user_id : ' + user_id);

/*
    const connection = await getConnection();

    const sql = `
    
      SELECT * FROM tbl_system_user_main 
      
      where user_id = '${user_id}' 

      and delete_flag = 'N';

    `;
    */

    const result = {

      message : '로그인 아이디를 확인 바랍니다.',
      result : 'success'

    };

    return result;

    /*
    const [rows, fields] = await connection.execute(sql);

    if(rows.length == 0){

      connection.release();

      const result = {

        message : '로그인 아이디를 확인 바랍니다.',
        result : 'fail'

      };

      return result;

    }

    if (rows[0].user_id == user_id) {
          
        const sql_menu_auth = `
      
          SELECT * FROM tbl_system_menu_auth 
          
          where user_key = '${rows[0].user_key}' 
    
          and delete_flag = 'N';
    
        `;
  
        const [rows_menu, fields_menu] = await connection.execute(sql_menu_auth);
      
        const data = { 
            
            message: 'Login successful',
            user_id : user_id,
            user_name :  rows[0].user_name,
            user_type : rows[0].user_type,
            menu_auth : rows_menu,

        };

        login( data ); // 로그인 성공

        connection.release(); // 연결 반환

        const result = {

          message : '세션 로그인 패스',
          result : 'success'
  
        };
      
        return result;
          
    } else {
      
        connection.release(); // 연결 반환

        const result = {

          message : '로그인 아이디를 확인 바랍니다.',
          result : 'fail'
  
        };

        
        return result;

    }
    */


  }catch(error){

    console.log('jk sessionStore error : ' + error);

    const result = {

      message : '세션 로그인 실패',
      result : 'fail'

    };

    return result;

  }

};

export default sessionStore;