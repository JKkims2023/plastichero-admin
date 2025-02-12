
function Layout({ children, pageTitle }) {
    return (
      <>
        <Head>
          <title>{pageTitle || 'My Site'}</title>
        </Head>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    );
  }
  
  export default Layout;