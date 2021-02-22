import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import React from 'react';

function Builder() {


    return (
        <Layout
            className="tzf"
            hasSider={true}
        >
            <Layout.Sider
                className="tzf-sider tzf-shadow"
                collapsed={true}
                collapsible={true}
                theme="light"
                width={320}
            >
                <Menu
                    mode="inline"
                    style={{ height: '100%' }}
                    theme="light"
                >
                    <Menu.Item>
                        Test
                    </Menu.Item>
                </Menu>
            </Layout.Sider>
            <Layout.Content
                className="tzf-content"
            >
                
            </Layout.Content>
        </Layout>
    )
}

export default Builder;