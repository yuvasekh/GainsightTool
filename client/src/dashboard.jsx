import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchObjects } from './api/api';
import { Table, Input, Button, Modal, Form, message } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined, 
  DatabaseOutlined,
  CloseOutlined
} from '@ant-design/icons';

// Create Object Modal Component
const CreateObjectModal = ({ onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createObjectAPI(values);
      message.success('Object created successfully!');
      onClose();
    } catch (error) {
      message.error('Error creating object');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="text-gray-900">Create New Object</span>}
      visible={true}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700" />}
      className="[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="space-y-6">
          <Form.Item
            name="objectName"
            label={<span className="text-gray-700 font-medium">Object Name</span>}
            rules={[{ required: true, message: 'Please enter object name' }]}
          >
            <Input 
              className="border-gray-300 text-gray-800 rounded-md h-10 hover:border-blue-600 focus:border-blue-600"
              placeholder="Enter object name"
            />
          </Form.Item>

          <Form.Item
            name="objectType"
            label={<span className="text-gray-700 font-medium">Object Type</span>}
            rules={[{ required: true, message: 'Please select object type' }]}
          >
            <Input 
              className="border-gray-300 text-gray-800 rounded-md h-10 hover:border-blue-600 focus:border-blue-600"
              placeholder="Enter object type"
            />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="h-10 px-6 text-gray-700 hover:bg-gray-100 border-gray-300"
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
const DashBoard = () => {
    // ... (keep previous state and logic the same) ...
    const [objectList, setObjectList] = useState([]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        async function readObjects() {
            try {
                const response = await fetchObjects();
                const temp = response?.data?.[0]?.objectList?.map(item => ({
                    objectType: item.objectType,
                    objectName: item.objectName,
                })) || [];
                setObjectList(temp);
            } catch (error) {
                message.error('Error fetching objects');
            }
        }
        readObjects();
    }, []);

    const handleViewFields = (objectName) => {
        navigate(`/fields/${objectName}`);
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const filteredData = objectList.filter((obj) => 
        obj.objectType.toLowerCase().includes(searchText.toLowerCase()) ||
        obj.objectName.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Object Type',
            dataIndex: 'objectType',
            key: 'objectType',
            render: (text) => <span className="text-gray-700 font-medium">{text}</span>,
        },
        {
            title: 'Object Name',
            dataIndex: 'objectName',
            key: 'objectName',
            render: (text) => <span className="text-gray-600">{text}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => handleViewFields(record.objectName)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                    View Fields
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-8 w-[80vw] ">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-300 h-10 px-6"
                        onClick={() => navigate('/')}
                    >
                        Disconnect
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
                            onClick={() => navigate('/migrations')}
                        >
                            Migration
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Object Management
                        </h1>
                        <Input
                            placeholder="Search objects..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={handleSearch}
                            className="w-full sm:w-64 rounded-md bg-white border-gray-300 text-gray-800 h-10 hover:border-blue-600 focus:border-blue-600"
                            allowClear
                        />
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="objectName"
                        pagination={false}
                        className="rounded-md overflow-hidden"
                        rowClassName="hover:bg-gray-50 transition-colors"
                        components={{
                            header: {
                                cell: (props) => (
                                    <th {...props} className="!bg-gray-50 !text-gray-700 !font-semibold !border-gray-200" />
                                ),
                            },
                        }}
                        locale={{
                            emptyText: (
                                <div className="text-gray-500 py-8">
                                    No objects available. Create your first object to begin.
                                </div>
                            )
                        }}
                    />
                </div>

                {isModalVisible && <CreateObjectModal onClose={() => setIsModalVisible(false)} />}
            </div>
        </div>
    );
};

export default DashBoard;