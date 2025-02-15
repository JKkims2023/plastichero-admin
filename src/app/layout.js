
import './globals.css';
import ClientLayout from './components/ClientLayout';


export default function RootLayout({ children }) {
  

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