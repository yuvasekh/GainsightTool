import React from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const MigrationLayout = () => {
  return (
    <Layout>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
          >
            <SubMenu
              key="sub1"
              icon={<UserOutlined />}
              title="Instances & Tables"
            >
              <Menu.Item key="1">Instance Overview</Menu.Item>
              <Menu.Item key="2">Manage Tables</Menu.Item>
              <Menu.Item key="3">Custom Tables</Menu.Item>
              <Menu.Item key="4">Contacts</Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<LaptopOutlined />} title="Field Management">
              <Menu.Item key="5">Create Fields</Menu.Item>
              <Menu.Item key="6">Rename Fields</Menu.Item>
              <Menu.Item key="7">Delete Fields</Menu.Item>
              <Menu.Item key="8">Bulk Edit</Menu.Item>
            </SubMenu>
            <SubMenu key="sub3" icon={<NotificationOutlined />} title="Migration & AI">
              <Menu.Item key="9">Field Migration</Menu.Item>
              <Menu.Item key="10">Push CTAs</Menu.Item>
              <Menu.Item key="11">Push Timeline</Menu.Item>
              <Menu.Item key="12">AI Recommendations</Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              background: "#fff",
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MigrationLayout;
