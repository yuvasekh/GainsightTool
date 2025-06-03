import React, { useEffect, useState, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Modal, 
  message, 
  Space, 
  Typography, 
  Tooltip 
} from 'antd';
import { 
  CheckCircleOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  KeyOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

// Constants
const CONNECTION_STORAGE_KEY = 'dashboard_connection';

// Utility functions
const validateUrl = (url) => {
  const urlPattern = /^https?:\/\/.+/;
  return urlPattern.test(url);
};

const saveConnectionToStorage = (connectionDetails) => {
  try {
    localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connectionDetails));
  } catch (error) {
    console.warn('Failed to save connection details:', error);
  }
};

const loadConnectionFromStorage = () => {
  try {
    const stored = localStorage.getItem(CONNECTION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load connection details:', error);
    return null;
  }
};

const clearConnectionFromStorage = () => {
  try {
    localStorage.removeItem(CONNECTION_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear connection details:', error);
  }
};

// Disconnect Confirmation Modal Component
const DisconnectModal = ({ visible, onClose, onConfirm, connectionDetails }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [requireCredentials, setRequireCredentials] = useState(true);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setRequireCredentials(true);
    }
  }, [visible, form]);

  const handleConfirm = async (values) => {
    setLoading(true);
    try {
      // Validate credentials match current connection
      if (requireCredentials) {
        if (!values.instanceUrl || !values.instanceToken) {
          message.error('Please provide both instance URL and access token');
          return;
        }

        if (values.instanceUrl !== connectionDetails?.instanceUrl) {
          message.error('Instance URL does not match current connection');
          return;
        }

        if (values.instanceToken !== connectionDetails?.instanceToken) {
          message.error('Access token does not match current connection');
          return;
        }
      }

      await onConfirm();
      message.success('Disconnected successfully');
      onClose();
    } catch (error) {
      console.error('Disconnect error:', error);
      message.error(error.message || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handleForceDisconnect = () => {
    Modal.confirm({
      title: 'Force Disconnect',
      icon: <WarningOutlined className="text-orange-500" />,
      content: (
        <div>
          <p>Are you sure you want to force disconnect without credential verification?</p>
          <p className="text-orange-600 text-sm mt-2">
            This action cannot be undone and will immediately terminate your session.
          </p>
        </div>
      ),
      okText: 'Force Disconnect',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await onConfirm();
          message.success('Force disconnected successfully');
          onClose();
        } catch (error) {
          console.error('Force disconnect error:', error);
          message.error('Failed to force disconnect');
        }
      }
    });
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined className="text-orange-500" />
          <span className="text-gray-900">Confirm Disconnection</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      className="[&_.ant-modal-content]:bg-white"
    >
      <div className="py-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <WarningOutlined className="text-orange-500 text-lg mt-0.5" />
            <div>
              <Text className="text-orange-800 font-medium block">Security Verification Required</Text>
              <Text className="text-orange-700 text-sm">
                To disconnect safely, please verify your credentials. This helps protect your session from unauthorized access.
              </Text>
            </div>
          </div>
        </div>

        {requireCredentials && (
          <Form 
            form={form} 
            onFinish={handleConfirm} 
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="instanceUrl"
              label={<span className="text-gray-700 font-medium">Verify Instance URL</span>}
              rules={[
                { required: true, message: 'Please enter instance URL' },
                { 
                  validator: (_, value) => {
                    if (!value || validateUrl(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Please enter a valid URL'));
                  }
                }
              ]}
            >
              <Input
                prefix={<LinkOutlined className="text-gray-400" />}
                className="border-gray-300 text-gray-800 rounded-md h-10"
                placeholder="Enter current instance URL"
              />
            </Form.Item>

            <Form.Item
              name="instanceToken"
              label={<span className="text-gray-700 font-medium">Verify Access Token</span>}
              rules={[
                { required: true, message: 'Please enter access token' },
                { min: 10, message: 'Access token seems too short' }
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined className="text-gray-400" />}
                className="border-gray-300 text-gray-800 rounded-md h-10"
                placeholder="Enter current access token"
              />
            </Form.Item>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="link"
                onClick={handleForceDisconnect}
                className="text-orange-600 hover:text-orange-700 p-0 h-auto"
              >
                Force Disconnect
              </Button>
              
              <Space>
                <Button
                  onClick={onClose}
                  disabled={loading}
                  className="text-gray-700 hover:bg-gray-100 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="bg-red-600 hover:bg-red-700 border-none"
                >
                  Confirm Disconnect
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

// Main Connection Manager Component
const ConnectionManager = ({ 
  onConnect, 
  onDisconnect,
  onRefresh,
  isConnected = false,
  connectionDetails = null,
  loading = false 
}) => {
  const [form] = Form.useForm();
  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnectModalVisible, setDisconnectModalVisible] = useState(false);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  // Auto-connect on component mount if saved connection exists
  useEffect(() => {
    if (!autoConnectAttempted && !isConnected) {
      const savedConnection = loadConnectionFromStorage();
      if (savedConnection) {
        handleAutoConnect(savedConnection);
      }
      setAutoConnectAttempted(true);
    }
  }, [autoConnectAttempted, isConnected]);

  const handleAutoConnect = async (savedConnection) => {
    try {
      setConnectLoading(true);
      await onConnect?.(savedConnection);
      message.success('Auto-connected using saved credentials');
    } catch (error) {
      console.error('Auto-connect failed:', error);
      clearConnectionFromStorage();
      message.warning('Auto-connect failed. Please reconnect manually.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleConnect = async (values) => {
    setConnectLoading(true);
    try {
      if (!validateUrl(values.instanceUrl)) {
        message.error('Please enter a valid URL (e.g., https://your-instance.com)');
        return;
      }

      await onConnect?.(values);
      message.success('Connected successfully!');
      saveConnectionToStorage(values);
      form.resetFields();
    } catch (error) {
      console.error('Connection error:', error);
      message.error(error.message || 'Connection failed. Please check your credentials.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectConfirm = async () => {
    try {
      await onDisconnect?.();
      clearConnectionFromStorage();
      setDisconnectModalVisible(false);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Connected State
  if (isConnected && connectionDetails) {
    return (
      <>
        <Card className="mb-6 border-green-200 bg-green-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CheckCircleOutlined className="text-green-600 text-lg" />
              <div>
                <Text className="text-green-800 font-medium block">Connected to Instance</Text>
                <Text className="text-green-600 text-sm">
                  URL: {connectionDetails.instanceUrl}
                </Text>
                <Text className="text-green-500 text-xs">
                  Token: {connectionDetails.instanceToken?.substring(0, 8)}...
                </Text>
              </div>
            </div>
            <Space>
              <Tooltip title="Refresh data from instance">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  loading={loading}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                >
                  Refresh
                </Button>
              </Tooltip>
              <Button
                icon={<DisconnectOutlined />}
                onClick={() => setDisconnectModalVisible(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                Disconnect
              </Button>
            </Space>
          </div>
        </Card>

        <DisconnectModal
          visible={disconnectModalVisible}
          onClose={() => setDisconnectModalVisible(false)}
          onConfirm={handleDisconnectConfirm}
          connectionDetails={connectionDetails}
        />
      </>
    );
  }

  // Disconnected State - Connection Form
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <div className="mb-4">
        <Title level={4} className="text-gray-900 mb-2">Connect to Instance</Title>
        <Text className="text-gray-600">
          Enter your instance URL and access token to connect and manage objects.
        </Text>
      </div>
      
      <Form 
        form={form} 
        onFinish={handleConnect} 
        layout="vertical"
        requiredMark={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="instanceUrl"
            label={<span className="text-gray-700 font-medium">Instance URL</span>}
            rules={[
              { required: true, message: 'Please enter instance URL' },
              { 
                validator: (_, value) => {
                  if (!value || validateUrl(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Please enter a valid URL starting with http:// or https://'));
                }
              }
            ]}
          >
            <Input
              prefix={<LinkOutlined className="text-gray-400" />}
              className="border-gray-300 text-gray-800 rounded-md h-10 hover:border-blue-600 focus:border-blue-600"
              placeholder="https://your-instance.com"
            />
          </Form.Item>

          <Form.Item
            name="instanceToken"
            label={<span className="text-gray-700 font-medium">Access Token</span>}
            rules={[
              { required: true, message: 'Please enter access token' },
              { min: 10, message: 'Access token seems too short' }
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined className="text-gray-400" />}
              className="border-gray-300 text-gray-800 rounded-md h-10 hover:border-blue-600 focus:border-blue-600"
              placeholder="Enter your access token"
            />
          </Form.Item>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={connectLoading || loading}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 border-none text-white font-medium"
          >
            {connectLoading ? 'Connecting...' : 'Connect to Instance'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default ConnectionManager;