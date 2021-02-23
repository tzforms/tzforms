import FileProtectOutlined from '@ant-design/icons/FileProtectOutlined';
import FileSearchOutlined from '@ant-design/icons/FileSearchOutlined';
import GithubOutlined from '@ant-design/icons/GithubOutlined';
import HeartFilled from '@ant-design/icons/HeartFilled';
import MailOutlined from '@ant-design/icons/MailOutlined';
import Layout from 'antd/lib/layout';
import Typography from 'antd/lib/typography';
import RcFooter from 'rc-footer';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
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
                            <Typography.Text type="secondary">
                                Made with <HeartFilled style={{ color: 'coral' }} />
                            </Typography.Text>
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
                                        icon: <GithubOutlined />,
                                        title: 'Source',
                                        url: 'https://github.com/tzforms/tzforms',
                                        openExternal: true
                                    },
                                    {
                                        icon: <FileSearchOutlined />,
                                        title: <Link to="/terms">Terms</Link>,
                                        LinkComponent: 'span'
                                    },
                                    {
                                        icon: <FileProtectOutlined />,
                                        title: <Link to="/privacy">Privacy</Link>,
                                        LinkComponent: 'span'
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