import { Button, Typography, Carousel, Card, Row, Col } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import img1 from "../assets/gam3a.jpg";
import img2 from "../assets/secureAccess.jpg";
import img3 from "../assets/manage.webp";
import UserManagement from "../assets/UserManagement.webp"
import Analytics from "../assets/Analytics-Dashboard.webp"
import SupportCenter from "../assets/support-center.jpg"
import Body from "./layouts/Body";


const { Title, Paragraph } = Typography;



const services = [
  {
    title: "User Management",
    desc: "Add, edit, and control user accounts.",
    img: UserManagement,
  },
  {
    title: "Analytics Dashboard",
    desc: "View insights and real-time stats.",
    img: Analytics,
  },
  {
    title: "Support Center",
    desc: "Get quick help and assistance.",
    img: SupportCenter,
  },
];

const phones = ["+20 111 222 333", "+20 222 333 444", "+20 333 444 555"];
const emails = ["support@system.com", "info@system.com", "help@system.com"];


const HomePage = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const handleGetStarted = () => {
    navigate("auth/login");
  };

    return (
      <Body>
        <div className="home-layout">

        <section className="welcome-section" style={{ position: "relative" }}>
            <button
            className="carousel-arrow left-arrow"
            onClick={() => carouselRef.current?.prev()}
            >
            <LeftOutlined />
            </button>

            <Carousel autoplay dots ref={carouselRef} className="welcome-carousel">
    
    {[img1, img2, img3].map((image, index) => (
        <div key={index}>
        <div
            className="welcome-slide"
            style={{
            backgroundImage: `url(${image})`,
            }}
        >
            <div className="welcome-content">
            <Title level={1} className="welcome-title">Welcome to the System</Title>
            <Paragraph className="welcome-text">
                Access your tools, manage information, and explore features easily.
            </Paragraph>
            <Button className="get-started-btn" onClick={handleGetStarted}>
                Get Started
            </Button>
            </div>
        </div>
        </div>
    ))}

    </Carousel>

            <button
            className="carousel-arrow right-arrow"
            onClick={() => carouselRef.current?.next()}
            >
            <RightOutlined />
            </button>
        </section>


        <section className="services-section" style={{ padding: "50px 0" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
            Our Services
            </Title>

            <Row gutter={[24, 24]} justify="center">
            {services.map((srv, idx) => (
                <Col xs={24} sm={12} md={8} key={idx}>
                <Card
                    bordered={false}
                    hoverable
                    style={{ textAlign: "center" }}
                    cover={
                    <img
                        src={srv.img}
                        alt={srv.title}
                        style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        }}
                    />
                    }
                >
                    <h3>{srv.title}</h3>
                    <p>{srv.desc}</p>
                </Card>
                </Col>
            ))}
            </Row>
        </section>


        <section className="contact-section" style={{ padding: "50px 0" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
            Contact Us
            </Title>

            <div
            className="contact-box"
            style={{
                display: "flex",
                justifyContent: "center",
                gap: "100px",
                flexWrap: "wrap",
            }}
            >
            <div style={{ minWidth: "200px" }}>
                <Title level={4}>Phone</Title>
                {phones.map((phone, idx) => (
                <p key={idx}>{phone}</p>
                ))}
            </div>

            <div style={{ minWidth: "200px" }}>
                <Title level={4}>Email</Title>
                {emails.map((email, idx) => (
                <p key={idx}>{email}</p>
                ))}
            </div>
            </div>
        </section>
        </div>
      </Body>
  );
};

export default HomePage;
