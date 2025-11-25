import { useNavigate } from "react-router-dom";
import { APP_BASE_PATH } from "../app/config";

export const useGoHome = () => {
    const navigate = useNavigate();
    
    return () => navigate(`${APP_BASE_PATH}/`);
};
