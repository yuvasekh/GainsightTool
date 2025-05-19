"use client"

import { useState, useEffect } from "react"
import { Modal, Tabs, Button, List, Typography, Space, Tag, Divider, Empty } from "antd"
import { 
  DownloadOutlined, 
  EyeOutlined, 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  FileExcelOutlined, 
  FileWordOutlined, 
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
  PaperClipOutlined
} from "@ant-design/icons"

const { TabPane } = Tabs
const { Title, Text } = Typography

export default function ActivityAttachmentsModal({ isOpen, onClose, activity, attachments = [] }) {
  const [activeTab, setActiveTab] = useState("all")
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [previewType, setPreviewType] = useState("none")
  const [previewContent, setPreviewContent] = useState(null)

  useEffect(() => {
    if (attachments.length > 0) {
      determinePreviewType(attachments[currentPreviewIndex])
    }
  }, [currentPreviewIndex, attachments])

  // Determine preview type based on file extension
  const determinePreviewType = (attachment) => {
    if (!attachment || !attachment.url) {
      setPreviewType("none")
      return
    }

    const fileExtension = attachment.name.split(".").pop().toLowerCase()

    // Image preview
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      setPreviewType("image")
      setPreviewContent(attachment.url)
      return
    }

    // PDF preview
    if (fileExtension === "pdf") {
      setPreviewType("pdf")
      setPreviewContent(attachment.url)
      return
    }

    // Text preview (for text files)
    if (["txt", "md", "csv", "json", "xml", "html", "css", "js"].includes(fileExtension)) {
      setPreviewType("text")
      // In a real app, you would fetch the text content here
      setPreviewContent(null)
      return
    }

    // No preview available
    setPreviewType("none")
  }

  // Handle downloading a single attachment
  const downloadAttachment = async (attachmentUrl, fileName) => {
    try {
      const response = await fetch(attachmentUrl)

      if (!response.ok) {
        throw new Error(`Failed to download attachment: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading attachment:", error)
      alert("Failed to download attachment. Please try again.")
    }
  }

  // Handle downloading all attachments
  const downloadAllAttachments = () => {
    if (attachments.length === 0) {
      alert("No attachments available to download.")
      return
    }

    // For each attachment, download it
    attachments.forEach((attachment, index) => {
      // Use a timeout to prevent browser from blocking multiple downloads
      setTimeout(() => {
        downloadAttachment(attachment.url, attachment.name)
      }, index * 500) // Stagger downloads by 500ms
    })
  }

  // Get file icon based on file extension
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileOutlined />

    const extension = fileName.split(".").pop().toLowerCase()

    // You can expand this with more file type icons
    switch (extension) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#ff4d4f" }} />
      case "doc":
      case "docx":
        return <FileWordOutlined style={{ color: "#1890ff" }} />
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ color: "#52c41a" }} />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <FileImageOutlined style={{ color: "#722ed1" }} />
      case "txt":
      case "md":
      case "csv":
        return <FileTextOutlined style={{ color: "#faad14" }} />
      default:
        return <FileOutlined style={{ color: "#8c8c8c" }} />
    }
  }

  // Determine if file is previewable
  const isPreviewable = (fileName) => {
    if (!fileName) return false

    const extension = fileName.split(".").pop().toLowerCase()
    return [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp", // Images
      "pdf", // PDFs
      "txt",
      "md",
      "csv",
      "json",
      "xml",
      "html",
      "css",
      "js", // Text files
    ].includes(extension)
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "Unknown size"

    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get file type label
  const getFileTypeLabel = (fileName) => {
    if (!fileName) return "Unknown"

    const extension = fileName.split(".").pop().toLowerCase()

    // Map extensions to more readable types
    const typeMap = {
      pdf: "PDF Document",
      doc: "Word Document",
      docx: "Word Document",
      xls: "Excel Spreadsheet",
      xlsx: "Excel Spreadsheet",
      jpg: "Image",
      jpeg: "Image",
      png: "Image",
      gif: "Image",
      webp: "Image",
      txt: "Text File",
      md: "Markdown",
      csv: "CSV Data",
      json: "JSON Data",
      xml: "XML Data",
      html: "HTML Document",
      css: "CSS Stylesheet",
      js: "JavaScript File",
    }

    return typeMap[extension] || `${extension.toUpperCase()} File`
  }

  // Navigation for preview
  const goToPreviousAttachment = () => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1)
    }
  }

  const goToNextAttachment = () => {
    if (currentPreviewIndex < attachments.length - 1) {
      setCurrentPreviewIndex(currentPreviewIndex + 1)
    }
  }

  // Preview content for the current attachment
  const renderPreviewContent = () => {
    if (attachments.length === 0 || currentPreviewIndex >= attachments.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full" style={{ padding: 48, background: "#f5f5f5", borderRadius: 8 }}>
          <Empty description="No attachment selected" />
        </div>
      )
    }

    const attachment = attachments[currentPreviewIndex]
    const fileName = attachment.name
    const fileUrl = attachment.url

    if (!fileName || !fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full" style={{ padding: 48, background: "#f5f5f5", borderRadius: 8 }}>
          <Empty description="Preview not available" />
        </div>
      )
    }

    const extension = fileName.split(".").pop().toLowerCase()

    // Image preview
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: "#f5f5f5", borderRadius: 8, padding: 16 }}>
          <img
            src={fileUrl || "/placeholder.svg"}
            alt={fileName}
            style={{ maxHeight: 500, maxWidth: "100%", objectFit: "contain", borderRadius: 4 }}
            onError={(e) => {
              e.currentTarget.src = "/image-preview-not-available.png"
            }}
          />
        </div>
      )
    }

    // PDF preview
    if (extension === "pdf") {
      return (
        <div style={{ height: "100%", background: "#f5f5f5", borderRadius: 8, padding: 16 }}>
          <iframe 
            src={`${fileUrl}#toolbar=0`} 
            style={{ width: "100%", height: "100%", border: "none", borderRadius: 4 }} 
            title={fileName} 
          />
        </div>
      )
    }

    // For text files, we would need to fetch the content
    if (["txt", "md", "csv", "json", "xml", "html", "css", "js"].includes(extension)) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", background: "#f5f5f5", borderRadius: 8, padding: 32 }}>
          <FileTextOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
          <Text style={{ marginBottom: 16, textAlign: "center" }}>Text preview is available but requires fetching content</Text>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => downloadAttachment(fileUrl, fileName)}
          >
            Download to view
          </Button>
        </div>
      )
    }

    // Default - no preview
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", background: "#f5f5f5", borderRadius: 8, padding: 48 }}>
        <div style={{ background: "white", padding: 24, borderRadius: "50%", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {getFileIcon(fileName)}
        </div>
        <Title level={5} style={{ marginBottom: 8 }}>Preview not available</Title>
        <Text type="secondary" style={{ marginBottom: 24, textAlign: "center" }}>
          This file type ({extension.toUpperCase()}) cannot be previewed directly
        </Text>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={() => downloadAttachment(fileUrl, fileName)}
        >
          Download to view
        </Button>
      </div>
    )
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <Space>
          <PaperClipOutlined />
          <span>Activity Attachments</span>
        </Space>
      }
      centered
    >
      <div style={{ marginTop: 16 }}>
        {activity?.note?.subject && (
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            {activity.note.subject}
          </Text>
        )}

        <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 16 }}>
          <TabPane tab="All Attachments" key="all">
            {attachments.length === 0 ? (
              <Empty 
                description="No attachments available" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                style={{ margin: "48px 0" }}
              />
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Text type="secondary">
                    {attachments.length} {attachments.length === 1 ? "attachment" : "attachments"}
                  </Text>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={downloadAllAttachments}
                  >
                    Download All
                  </Button>
                </div>

                <List
                  itemLayout="horizontal"
                  dataSource={attachments}
                  renderItem={(attachment, index) => (
                    <List.Item
                      key={index}
                      actions={[
                        isPreviewable(attachment.name) && (
                          <Button
                            key="preview"
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setCurrentPreviewIndex(index)
                              setActiveTab("preview")
                            }}
                          >
                            Preview
                          </Button>
                        ),
                        <Button
                          key="download"
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadAttachment(attachment.url, attachment.name)}
                        >
                          Download
                        </Button>
                      ].filter(Boolean)}
                      style={{ padding: "12px 0" }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{ background: "#f5f5f5", padding: 12, borderRadius: 8, fontSize: 20 }}>
                            {getFileIcon(attachment.name)}
                          </div>
                        }
                        title={attachment.name}
                        description={
                          <Space>
                            <Tag color="blue">{getFileTypeLabel(attachment.name)}</Tag>
                            <Text type="secondary">{formatFileSize(attachment.size)}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </TabPane>
          <TabPane tab="Preview" key="preview" disabled={attachments.length === 0}>
            {attachments.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Space direction="vertical" size={4} style={{ flex: 1 }}>
                    <Space>
                      {getFileIcon(attachments[currentPreviewIndex]?.name)}
                      <Text strong>{attachments[currentPreviewIndex]?.name || "No attachment selected"}</Text>
                    </Space>
                    <Space>
                      <Tag color="blue">{getFileTypeLabel(attachments[currentPreviewIndex]?.name)}</Tag>
                      <Text type="secondary">
                        {currentPreviewIndex + 1} of {attachments.length}
                      </Text>
                    </Space>
                  </Space>

                  <Space>
                    <Button
                      icon={<LeftOutlined />}
                      disabled={currentPreviewIndex === 0}
                      onClick={goToPreviousAttachment}
                    />
                    <Button
                      icon={<RightOutlined />}
                      disabled={currentPreviewIndex === attachments.length - 1}
                      onClick={goToNextAttachment}
                    />
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        downloadAttachment(
                          attachments[currentPreviewIndex]?.url,
                          attachments[currentPreviewIndex]?.name
                        )
                      }
                    >
                      Download
                    </Button>
                  </Space>
                </div>

                <div style={{ height: 500, border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
                  {renderPreviewContent()}
                </div>
              </>
            )}
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  )
}
