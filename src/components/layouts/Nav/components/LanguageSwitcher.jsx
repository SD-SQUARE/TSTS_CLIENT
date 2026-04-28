// LanguageSwitcher
import { Avatar, Button, Space } from "antd";
import i18n from "../../../../i18n";
import { useMemo, useState } from "react";
import egFlag from "../../../../assets/lang/eg-flag.svg";
import ukFlag from "../../../../assets/lang/uk-flag.svg";
import { useQueryClient } from "@tanstack/react-query";

const languages = {
    en: { label: "English", flag: ukFlag },
    ar: { label: "العربية", flag: egFlag },
};

const LanguageSwitcher = () => {
    const [lang, setLang] = useState((i18n.language || "en").split("-")[0]);
    const queryClient = useQueryClient();

    const currentLang = useMemo(() => (lang || "en").split("-")[0], [lang]);
    const currentLangData = languages[currentLang] || languages.en;

    const onChange = () => {
        const nextLang = currentLang === "ar" ? "en" : "ar";
        i18n.changeLanguage(nextLang);
        setLang(nextLang);
        queryClient.invalidateQueries();
    };

    return (
        <Button
            type="text"
            onClick={onChange}
            style={{
                height: "auto",
                color: "white",
                paddingInline: 10,
                borderRadius: 999,
            }}
        >
            <Space style={{ userSelect: "none" }}>
                <Avatar shape="square" size="small" src={currentLangData.flag} />
                {/* <span>{currentLangData.label}</span> */}
            </Space>
        </Button>
    );
};

export default LanguageSwitcher;
