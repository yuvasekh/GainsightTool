import { useLocation } from "react-router-dom"

const PageTitle = () => {
  const location = useLocation()
  const path = location.pathname

  // Map routes to titles
  const getTitleFromPath = () => {
    if (path === "/") return "Instance Manager"
    if (path === "/migrations") return "Field Migration"
    if (path === "/objects") return "Manage Tables"
    if (path === "/dashboard") return "Dashboard"
    if (path.startsWith("/fields/")) {
      const objectName = path.split("/").pop()
      return `${objectName?.charAt(0).toUpperCase()}${objectName?.slice(1)} Fields`
    }
    if (path === "/push-ctas") return "Push CTAs"
    if (path === "/ai-recommendations") return "AI Recommendations"

    return "Dashboard"
  }

  return <h2 className="text-lg font-medium">{getTitleFromPath()}</h2>
}

export default PageTitle
