
import { Layout } from "antd"
import Body from "./components/layouts/Body"
import NavBar from "./components/layouts/Nav/NavBar"
import AppFooter from "./components/layouts/AppFooter"
import NavItem from "./components/layouts/Nav/components/NavItem"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./routes/AppRoutes"

function App() {
    
    return (
        <BrowserRouter>
            <Layout style={{ width: '100%', height: '100vh' }} className="white-bg">
                {/* Navigation bar */}
                <NavBar>
                    <NavItem to="/">Home</NavItem>
                    <NavItem to="/about">About</NavItem>
                </NavBar>

                {/* Pages Content */}
                <Body>
                    <AppRoutes />
                </Body>
                {/* Footer */}
                <AppFooter />
            </Layout>
        </BrowserRouter>
    )
}

export default App
