import Typography from 'antd/lib/typography';
import React, { Fragment } from 'react';

function Home() {


    return (
        <div className="tzf-banner">
            <div className="tzf-container tzf-pad">
                <Typography.Title 
                    style={{
                        color: '#333333',
                        fontWeight: 300,
                        marginBottom: '4px'
                    }}
                >
                    Create incredible forms backed by smart contracts.
                </Typography.Title>
            </div>
        </div>
    );
}

export default Home;