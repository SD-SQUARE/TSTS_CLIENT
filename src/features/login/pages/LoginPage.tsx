
import PageLayout from "../../../components/PageLayout";
import LoginFormV2 from "../components/LoginFormV2";

export const LoginPage = () => {
    return (
            <PageLayout>
                <div
                    style={{
                        width: "100%",
                        minHeight: "calc(100vh - 180px)",
                        padding: "40px 0 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* <LoginForm /> */}
                    <LoginFormV2 />
                </div>
            </PageLayout>
    );
};
