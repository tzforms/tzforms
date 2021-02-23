import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Typography from 'antd/lib/typography';
import React from 'react';
import { HomeProps } from './Home.types';

function Home(props: HomeProps) {


    return (
        <div className="tzf-banner">
            <div className="tzf-container tzf-pad">
                <Typography.Title
                    className="tzf-text-center-sm"
                    style={{
                        color: '#333333',
                        fontWeight: 300
                    }}
                >
                    Create incredible forms backed by smart contracts.
                </Typography.Title>
                <Row className="tzf-justify-content-center-sm" gutter={20}>
                    <Col className="tzf-text-center-sm">
                        <Button
                            className="tzf-shadow-light"
                            shape="round"
                            type="text"
                            onClick={() => props.history.push('/templates')}
                        >
                            View templates
                        </Button>
                    </Col>
                    <Col className="tzf-text-center-sm">
                        <Button
                            className="tzf-shadow-light"
                            shape="round"
                            type="text"
                            onClick={() => props.history.push('/builder')}
                        >
                            Get started
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Home;