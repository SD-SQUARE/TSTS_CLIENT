// LanguageSwitcher
import { Dropdown, Space } from "antd";
import i18n from "../../../../i18n";
import { useState } from "react";

const languages = {
    en: { label: "English", flag: "🇬🇧" },
    ar: { label: "العربية", flag: "🇪🇬" },
};

// single language dropdown item
const items = Object.entries(languages).map(([key, val]) => ({
    key,
    label: (
        <Space>
            <span style={{ fontSize: 20 }}>{val.flag}</span>
            {val.label}
        </Space>
    ),
}));

const LanguageSwitcher = () => {

    const [lang, setLang] = useState(i18n.language)
    
    const onChange = (key) => {
        i18n.changeLanguage(key);
        setLang(key)
    };


    return (
        <Dropdown
            menu={{
                items,
                onClick: ({ key }) => onChange(key),
            }}
            placement="bottom"
            arrow
        >
            <Space style={{ cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontSize: 28 }}>{languages[lang].flag}</span>
            </Space>
        </Dropdown>
    );
};

export default LanguageSwitcher;
