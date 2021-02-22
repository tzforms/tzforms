import Layout from 'antd/lib/layout';
import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import Footer from '~components/Footer';
import Header from '~components/Header';

function Home() {


    return (
        <Fragment>
            <Helmet>
                <title>Home | tzforms</title>
            </Helmet>

            <Layout>
                <Header />
                <Layout.Content>
                    Home
                </Layout.Content>
                <Footer />
            </Layout>
        </Fragment>
    );
}

export default Home;