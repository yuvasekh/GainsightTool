import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addInstance } from './api/api';
import { LockOutlined, LinkOutlined } from '@ant-design/icons';
import { Input, Button, message } from 'antd';

const InstanceManager = () => {
    const [instanceUrl, setInstanceUrl] = useState('');
    const [accessKey, setAccessKey] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleConnect = async () => {
        if (!instanceUrl || !accessKey) {
            message.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await addInstance(instanceUrl, accessKey);
            console.log(res)
            if (res?.message) {
                message.success('Connected successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error('Connection failed. Please check your credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-[79vw] flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                        Instance Connection
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Connect to your enterprise instance using your credentials
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instance URL
                        </label>
                        <Input
                            prefix={<LinkOutlined className="text-gray-400" />}
                            placeholder="https://your-instance.example.com"
                            value={instanceUrl}
                            onChange={(e) => setInstanceUrl(e.target.value)}
                            className="h-10 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Key
                        </label>
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Enter access key"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                            className="h-10 rounded-lg"
                        />
                    </div>

                    <Button
                        type="primary"
                        block
                        size="large"
                        loading={loading}
                        onClick={handleConnect}
                        className="h-10 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 border-none"
                    >
                        Connect to Instance
                    </Button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Need help? Contact your system administrator</p>
                </div>
            </div>
        </div>
    );
};

export default InstanceManager;