
import './globals.css';
import ClientLayout from './components/ClientLayout';
import { startCronJob } from './cron';

export default function RootLayout({ children }) {
  
  /*
  try{

    console.log('Cron function call before');
    startCronJob();

    console.log('Cron function call after');

  }catch(error){

    console.log('Cron function call error');
    console.log(error);

  }
  */

  return (
    <html lang="en">
      <body style={{width:'100%', height:'100%'}}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );

}