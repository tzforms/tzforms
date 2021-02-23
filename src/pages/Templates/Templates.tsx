import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Typography from 'antd/lib/typography';
import React from 'react';
import { TemplatesProps } from './Templates.types';

function Templates(props: TemplatesProps) {


    return (
        <div className="tzf-container tzf-pad">
            <Row>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Card
                        className="tzf-shadow tzf-border-radius-round"
                        cover={<img src="https://via.placeholder.com/400x200" />}
                        title="Donation"
                    >
                        <Typography.Paragraph style={{ textAlign: 'center' }}>
                            A donation button with optional name and message fields.
                        </Typography.Paragraph>
                        <Button
                            block={true}
                            shape="round"
                            type="primary"
                            onClick={() => props.history.push('/builder?template=donation')}
                        >
                            Use this template
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Templates;