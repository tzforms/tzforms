import CodeFilled from '@ant-design/icons/CodeFilled';
import GithubFilled from '@ant-design/icons/GithubFilled';
import HeartFilled from '@ant-design/icons/HeartFilled';
import MailOutlined from '@ant-design/icons/MailOutlined';
import Layout from 'antd/lib/layout';
import Space from 'antd/lib/space';
import Typography from 'antd/lib/typography';
import RcFooter from 'rc-footer';
import React from 'react';
import { withRouter } from 'react-router-dom';
import tzformsNoSpaceWebp from '~assets/images/tzforms_no_space.webp';
import { FooterProps } from './Footer.types';

function Footer(props: FooterProps) {
    return (
        <Layout.Footer className={props.className}>
            <div className="tzf-shadow-light">
                <div className="tzf-container tzf-pad-x">
                    <RcFooter
                        columnLayout="space-between"
                        bottom={(
                            <Space size="small">
                                <Typography.Text type="secondary">
                                    Made with
                            </Typography.Text>
                                <HeartFilled style={{ color: 'coral' }} />
                                <Typography.Text type="secondary">
                                    by <a href="https://github.com/matthewdowns">Matthew Downs</a>
                                </Typography.Text>
                            </Space>
                        )}
                        columns={[
                            {
                                title: (
                                    <img
                                        height={20}
                                        src={tzformsNoSpaceWebp}
                                    />
                                ),
                                items: [
                                    {
                                        icon: <MailOutlined />,
                                        title: 'support@tzforms.com',
                                        url: 'mailto:support@tzforms.com'
                                    }
                                ]
                            },
                            {
                                title: 'Resources',
                                items: [
                                    {
                                        icon: <GithubFilled />,
                                        title: 'Github',
                                        url: 'https://github.com/tzforms/tzforms',
                                        openExternal: true
                                    }
                                ]
                            }
                        ]}
                        theme="light"
                    />
                </div>
            </div>
        </Layout.Footer>
    )
}

export default withRouter(Footer);