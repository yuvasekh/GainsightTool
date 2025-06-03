import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchObjects } from './api/api';
import ConnectionManager from './components/ConnectionManager'; // Import the new component
import { 
  Table, 
  Input, 
  Button, 
  Modal, 
  Form, 
  message, 
  Card, 
  Select,
  Spin,
  Empty,
  Space,
  Typography,
  Tag,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined, 
  DatabaseOutlined,
  CloseOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Constants
const OBJECT_TYPES = [
  'Custom Object',
  'Standard Object',
  'External Object',
  'Platform Event',
  'Custom Setting'
];

// Create Object Modal Component
const CreateObjectModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // await createObjectAPI(values);
      message.success('Object created successfully!');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating object:', error);
      message.error(error.message || 'Error creating object');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined className="text-blue-600" />
          <span className="text-gray-900">Create New Object</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700" />}
      className="[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white"
      destroyOnClose
    >
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical"
        requiredMark={false}
      >
        <div className="space-y-6 pt-4">
          <Form.Item
            name="objectName"
            label={<span className="text-gray-700 font-medium">Object Name</span>}
            rules={[
              { required: true, message: 'Please enter object name' },
              { min: 2, message: 'Object name must be at least 2 characters' },
              { max: 50, message: 'Object name cannot exceed 50 characters' }
            ]}
          >
            <Input 
              className="border-gray-300 text-gray-800 rounded-md h-10 hover:border-blue-600 focus:border-blue-600"
              placeholder="Enter object name"
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="objectType"
            label={<span className="text-gray-700 font-medium">Object Type</span>}
            rules={[{ required: true, message: 'Please select object type' }]}
          >
            <Select 
              className="h-10"
              placeholder="Select object type"
            >
              {OBJECT_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleCancel}
              className="h-10 px-6 text-gray-700 hover:bg-gray-100 border-gray-300"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 border-none text-white font-medium"
            >
              Create Object
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [objectList, setObjectList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadObjects = useCallback(async (connection) => {
    if (!connection) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchObjects(connection.instanceUrl, connection.instanceToken, true);
      console.log('API Response:', response); // Debug log
      
      const objects = response?.map(item => ({
        // Map API response fields to table column fields
        name: item.name,
        objectId: item.objectId,
        label: item.label,
        description: item.description,
        group: item.group,
        recordCount: item.recordCount,
        dataStoreType: item.dataStoreType,
        modifiedDate: item.modifiedDate,
        modifiedDateStr: item.modifiedDateStr,
        modifiedByName: item.modifiedByName,
        honorFieldLevelPermission: item.honorFieldLevelPermission,
        // Add fields that table columns expect
        objectName: item.name, // Use 'name' as 'objectName'
        objectType: item.dataStoreType || item.group || 'Unknown', // Use available field for type
        key: item.objectId, // Use objectId as key for table
      })) || [];
      
      console.log('Mapped Objects:', objects); // Debug log
      setObjectList(objects);
    } catch (error) {
      console.error('Error loading objects:', error);
      setError(error.message || 'Failed to load objects');
      message.error('Failed to load objects. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConnect = async (values) => {
    setConnectionDetails(values);
    setIsConnected(true);
    await loadObjects(values);
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setConnectionDetails(null);
    setObjectList([]);
    setError(null);
    // Note: ConnectionManager handles the success message
  };

  const handleRefresh = () => {
    if (connectionDetails) {
      loadObjects(connectionDetails);
    }
  };

  const handleViewFields = (objectName, objectId) => {
  
    navigate(`/fields/${objectName}`, { 
      state: { connectionDetails, objectId} 
    });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleCreateSuccess = () => {
    handleRefresh();
  };

  const filteredData = useMemo(() => {
    return objectList.filter((obj) => 
      obj.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      obj.label?.toLowerCase().includes(searchText.toLowerCase()) ||
      obj.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      obj.group?.toLowerCase().includes(searchText.toLowerCase()) ||
      obj.objectName?.toLowerCase().includes(searchText.toLowerCase()) ||
      obj.objectType?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [objectList, searchText]);

  const columns = [
    {
      title: 'Object Name',
      dataIndex: 'name', // Use 'name' from API response
      key: 'name',
      render: (text, record) => (
        <div>
          <Text className="font-medium text-gray-900">{text}</Text>
          {record.label && record.label !== text && (
            <div className="text-sm text-gray-500">{record.label}</div>
          )}
        </div>
      ),
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Type/Group',
      dataIndex: 'group', // Use 'group' from API response
      key: 'group',
      render: (text, record) => (
        <div>
          <Tag color="blue">{text}</Tag>
          {record.dataStoreType && (
            <div className="text-xs text-gray-500 mt-1">{record.dataStoreType}</div>
          )}
        </div>
      ),
      sorter: (a, b) => (a.group || '').localeCompare(b.group || ''),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Text className="text-gray-600" ellipsis={{ tooltip: text }}>
          {text || 'No description'}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: 'Record Count',
      dataIndex: 'recordCount',
      key: 'recordCount',
      render: (count) => (
        <Badge 
          count={count || 0} 
          showZero 
          style={{ backgroundColor: '#52c41a' }}
        />
      ),
      sorter: (a, b) => (a.recordCount || 0) - (b.recordCount || 0),
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleViewFields(record.name, record.objectId)} // Pass both name and objectId
          className="bg-blue-600 hover:bg-blue-700 text-white border-none"
        >
          View Fields
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-300 h-10 px-6"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          
          {isConnected && (
            <Space wrap>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                className="bg-blue-600 hover:bg-blue-700 border-none font-medium h-10 px-6 text-white"
                onClick={() => setIsModalVisible(true)}
              >
                Create Object
              </Button>
              <Button
                icon={<DatabaseOutlined />}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300 h-10 px-6"
                onClick={() => navigate('/migrations', { state: { connectionDetails } })}
              >
                Migration
              </Button>
            </Space>
          )}
        </div>

        {/* Connection Manager - Replaces the old ConnectionForm */}
        <ConnectionManager
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onRefresh={handleRefresh}
          isConnected={isConnected}
          connectionDetails={connectionDetails}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <ExclamationCircleOutlined className="text-red-600 text-lg" />
              <div>
                <Text className="text-red-800 font-medium">Error Loading Data</Text>
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Debug Info - Remove this in production */}
        {objectList.length === 0 && !loading &&  (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-3">
              <ExclamationCircleOutlined className="text-yellow-600 text-lg" />
              <div>
                <Text className="text-yellow-800 font-medium">Debug Info</Text>
                <div className="text-yellow-700 text-sm">
                  Connected but no objects found. Check console for API response details.
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {objectList.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <Title level={2} className="!mb-0 text-gray-900">
                Object Management ({objectList.length} objects)
              </Title>
              <Input
                placeholder="Search objects..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={handleSearch}
                className="w-full sm:w-64 rounded-md bg-white border-gray-300 text-gray-800 h-10 hover:border-blue-600 focus:border-blue-600"
                allowClear
              />
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="objectId" // Use objectId as row key
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  total: filteredData.length,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} objects`,
                }}
                className="rounded-md overflow-hidden"
                rowClassName="hover:bg-gray-50 transition-colors"
                locale={{
                  emptyText: (
                    <Empty
                      description={
                        <div>
                          <div>No objects found</div>
                          {objectList.length === 0 && !loading && (
                            <div className="text-xs text-gray-500 mt-2">
                              Try refreshing or check your API response
                            </div>
                          )}
                        </div>
                      }
                      className="py-8"
                    />
                  )
                }}
                scroll={{ x: 800 }}
              />
            </Spin>
          </div>
        )}

        {/* Connection Prompt */}
        {!isConnected && (
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
            <DatabaseOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={3} className="text-gray-900 mb-2">
              Connect to Your Instance
            </Title>
            <Text className="text-gray-600">
              Please connect to your instance using the form above to start managing objects.
            </Text>
          </div>
        )}

        {/* Create Object Modal */}
        <CreateObjectModal 
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
};

export default Dashboard;