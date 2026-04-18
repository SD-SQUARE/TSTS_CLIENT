// LanguageSwitcher
import { Avatar, Dropdown, Space } from "antd";
import i18n from "../../../../i18n";
import { useState } from "react";
import egFlag from '../../../../assets/lang/eg-flag.svg';
import ukFlag from '../../../../assets/lang/uk-flag.svg';
import { useQueryClient } from "@tanstack/react-query";

const languages = {
    en: { label: "English", flag: ukFlag },
    ar: { label: "العربية", flag: egFlag },
};

// single language dropdown item
const items = Object.entries(languages).map(([key, val]) => ({
    key,
    label: (
        <Space>
            <Avatar shape="square"  size={"small"} src={val.flag} />
            {val.label}
        </Space>
    ),
}));

const LanguageSwitcher = () => {

    const [lang, setLang] = useState(i18n.language);
    const queryClient = useQueryClient();
    const onChange = (key) => {
        i18n.changeLanguage(key);
        setLang(key)

        queryClient.invalidateQueries(); 
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
                {(() => {
                    const currentLang = (lang || 'en').split('-')[0];
                    const langData = languages[currentLang] || languages['en'];
                    return <Avatar shape="square" src={langData.flag} />;
                })()}
            </Space>
        </Dropdown>
    );
};

export default LanguageSwitcher;
