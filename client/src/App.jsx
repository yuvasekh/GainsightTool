import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { FloatButton, Input } from 'antd';
import { MessageOutlined, CommentOutlined } from '@ant-design/icons';
import InstanceManager from './InstanceManager';
import MigrationPage from './Migrations';
import DashBoard from './dashboard';
import FieldsListing from './FieldsListing';
import './App.css'
// import React, { useState } from 'react';
import axios from 'axios';
import { FloatButton, Input, Spin, Timeline } from 'antd';
import { message } from './api/api';
import Sidebar from './components/Sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar  from "./components/App-sidebar"
// import { MessageOutlined } from '@ant-design/icons';
// 
// import React, { useState } from 'react';
// import { FloatButton, Input, Spin } from 'antd';
// import { MessageOutlined } from '@ant-design/icons';

// Example message() function signature: message(userInput, chatHistory)
// const ChatBot = () => {
//   const [open, setOpen] = useState(false);
//   const [chatHistory, setChatHistory] = useState([
//   ]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userEntry = {
//       role: 'user',
//       parts: [{ text: input }]
//     };

//     setChatHistory(prev => [...prev, userEntry]);
//     setInput('');
//     setLoading(true);

//     try {
//       const res = await message(input, [...chatHistory, userEntry]);
//       console.log(res, 'res1');

//       const botEntry = {
//         role: 'model',
//         parts: [
//           {
//             text: res
//           }
//         ]
//       };

//       setChatHistory(prev => [...prev, botEntry]);
//     } catch (err) {
//       setChatHistory(prev => [
//         ...prev,
//         {
//           role: 'model',
//           parts: [{ text: 'Error contacting support service.' }]
//         }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-wrapper">
//       <FloatButton.Group
//         trigger="click"
//         type="primary"
//         icon={<MessageOutlined />}
//         open={open}
//         onClick={() => setOpen(!open)}
//         className="right-[150px] bottom-4"
//       >
//         <div className="chat-window bg-white shadow-lg rounded-lg w-80 h-[30rem] flex flex-col">
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="font-semibold">AI Support Assistant</h3>
//           </div>
//           <div className="p-4 flex-1 overflow-y-auto space-y-2 text-sm">
//             {chatHistory.map((msg, idx) => (
//               <div key={idx}>
//                 {msg.parts.map((part, pIdx) => (
//                   <div
//                     key={pIdx}
//                     className={`p-2 rounded-lg my-1 ${
//                       msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
//                     }`}
//                   >
//                     {part.text}
//                   </div>
//                 ))}
//               </div>
//             ))}
//             {loading && (
//               <div className="text-gray-400 italic text-sm text-left">
//                 <Spin size="small" /> Thinking...
//               </div>
//             )}
//           </div>
//           <div className="p-4 border-t border-gray-200">
//             <Input.TextArea
//               placeholder="Type your question..."
//               autoSize={{ minRows: 1, maxRows: 3 }}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onPressEnter={(e) => {
//                 if (!e.shiftKey) {
//                   e.preventDefault();
//                   sendMessage();
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </FloatButton.Group>
//     </div>
//   );
// };





import PageTitle from "./components/PageTitle"

// Import your page components
// import InstanceManager from "./InstanceManager"
import "./App.css"
import FieldConfiguration from './components/EditFields';
import { ActivityFeed } from './components/ActivityFeed';
import CompanyTimelinePage from './components/ActivityFeedByCompany';

// Layout Component with Sidebar and Content
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen ">
      <AppSidebar />
      <div className="flex-1 ">
        <div className="flex items-center h-12 border-b px-6">
          <SidebarTrigger className="mr-2" />
          <PageTitle />
        </div>
        <div className="p-6 relative">
          {children}
          {/* <ChatBot /> */}
        </div>
      </div>
    </div>
  )
}

// App Component with Router
const App = () => {
  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <InstanceManager />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <MigrationPage />
              </Layout>
            }
          />
          <Route
            path="/objects"
            element={
              <Layout>
                <DashBoard />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <DashBoard />
              </Layout>
            }
          />
          <Route
            path="/fields/:objectName"
            element={
              <Layout>
                <FieldsListing />
              </Layout>
            }
          />
                <Route
            path="/migrations"
            element={
              <Layout>
                <MigrationPage />
              </Layout>
            }
          />
           <Route
            path="/editfields"
            element={
              <Layout>
                <FieldConfiguration />
              </Layout>
            }
          />
          {/* Add additional routes as needed */}
          <Route
            path="/push-ctas"
            element={
              <Layout>
                <div>Push CTAs Page</div>
              </Layout>
            }
          />
          <Route
            path="/ai-recommendations"
            element={
              <Layout>
                <div>AI Recommendations Page</div>
              </Layout>
            }
          />
             <Route
            path="/timeline"
            element={
              <Layout>
             <ActivityFeed/>
              </Layout>
            }
          />
               <Route
            path="/timeline/:companyId"
            element={
              <Layout>
             <CompanyTimelinePage/>
              </Layout>
            }
          />
        </Routes>
      </SidebarProvider>
    </Router>
  )
}

export default App
