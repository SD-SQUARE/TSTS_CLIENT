import { Button, Typography, Row, Col, Card, Avatar } from "antd";
import { 
  ArrowRightOutlined, 
  ArrowLeftOutlined,
  TeamOutlined, 
  AreaChartOutlined, 
  CustomerServiceOutlined,
  PhoneOutlined, 
  MailOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Body from "./layouts/Body";



import AnalyticsImg from "../assets/Analytics-Dashboard.webp";
import UserMgmtImg from "../assets/UserManagement.webp";
import SupportImg from "../assets/support-center.jpg";
import { useSelector } from "react-redux";
import { APP_BASE_PATH } from "../app/config";
import TrustedDeviceTour from "./TrustedDeviceTour.home.component";

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

    const { user } = useSelector((state: any) => state.auth);

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const services = [
    {
      title: t('home.service_user_title'),
      desc: t('home.service_user_desc'),
      icon: <TeamOutlined />,
      image: UserMgmtImg,
    },
    {
      title: t('home.service_analytics_title'),
      desc: t('home.service_analytics_desc'),
      icon: <AreaChartOutlined />,
      image: AnalyticsImg,
    },
    {
      title: t('home.service_support_title'),
      desc: t('home.service_support_desc'),
      icon: <CustomerServiceOutlined />,
      image: SupportImg,
    },
  ];

  const phones = ["+20 111 222 333", "+20 222 333 444"];
  const emails = ["support@helwan.edu.eg", "help@helwan.edu.eg"];

  return (
      <Body>
          <TrustedDeviceTour />
      <div className="corporate-home" dir={isArabic ? "rtl" : "ltr"}>
        
        <section className="hero-section">
          <div className="container">
            <Row align="middle" gutter={[48, 48]}>
              <Col xs={24} md={12} className="hero-text-col">
                <div className="accent-bar"></div>
                <Title level={1} className="hero-title">
                  {t('home.hero_title')} <br />
                  <span className="gold-text">{t('home.hero_subtitle')}</span>
                </Title>
                <Paragraph className="hero-desc">
                  {t('home.hero_desc')}
                </Paragraph>
                <Button 
                    type="primary" 
                    size="large" 
                    className="hero-btn"
                    onClick={() => {
                                    !user ? navigate(`${APP_BASE_PATH}/auth/login`) : navigate(`${APP_BASE_PATH}/knowledge-base`);
                        }
                    }
                >
                  {t('home.get_started')}
                </Button>
              </Col>
              
              <Col xs={24} md={12} className="hero-visual-col">
                <div className="stack-container">
                    <img src={AnalyticsImg} alt="Dashboard" className="img-back" />
                    <img src={SupportImg} alt="Support" className="img-front" />
                </div>
              </Col>
            </Row>
          </div>
        </section>

        <section className="services-overlap">
          <div className="container">
            <Row gutter={[24, 24]} justify="center">
              {services.map((srv, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card className="service-card" bordered={false}>
                    <div className="card-header">
                        <Avatar 
                            shape="square" 
                            size={48} 
                            icon={srv.icon} 
                            className="card-icon" 
                        />
                        <Title level={4} className="card-title">{srv.title}</Title>
                    </div>
                    <div className="card-img-wrapper">
                        <img src={srv.image} alt={srv.title} />
                    </div>
                    <Paragraph className="card-text">
                        {srv.desc}
                    </Paragraph>
                    <div className="card-link-wrapper">
                        <a href="#" className="card-link">
                            {t('home.learn_more')} 
                            {isArabic ? <ArrowLeftOutlined style={{ marginRight: 8 }} /> : <ArrowRightOutlined style={{ marginLeft: 8 }} />}
                        </a>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section className="contact-strip">
          <div className="strip-container">
            <Row align="middle" justify="space-between" gutter={[24, 24]}>
              
              <Col xs={24} md={8}>
                <Title level={4} className="white-text strip-title">
                  {t('home.need_help')}
                </Title>
                <Text className="blue-grey-text">
                  {t('home.reach_team')}
                </Text>
              </Col>

              <div className="divider-vertical desktop-only"></div>

              <Col xs={24} md={7} className="contact-col">
                <div className="icon-box">
                    <PhoneOutlined />
                </div>
                <div className="contact-details">
                    <Text strong className="white-text">{t('user_list.phone')}</Text>
                    {phones.map((p, i) => <div key={i} className="light-text">{p}</div>)}
                </div>
              </Col>

              <Col xs={24} md={7} className="contact-col">
                <div className="icon-box gold-box">
                    <MailOutlined />
                </div>
                <div className="contact-details">
                    <Text strong className="white-text">{t('user_list.email')}</Text>
                    {emails.map((e, i) => <div key={i} className="light-text">{e}</div>)}
                </div>
              </Col>

            </Row>
          </div>
        </section>

      </div>
    </Body>
  );
};

export default HomePage;