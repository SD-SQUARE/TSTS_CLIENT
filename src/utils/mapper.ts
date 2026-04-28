export type FieldMapper<T> = {
    [formField: string]: (record: T) => any;
};

/**
 * Maps nested objects in a record to flat form values based on a mapping configuration.
 * @param record The entity to map
 * @param mappers An object where key = form field name, value = function that extracts value from record
 */
export function mapRecordToFormValues<T>(record: T, mappers: FieldMapper<T>): Record<string, any> {
    const mapped: Record<string, any> = { ...record };

    const localizedFields = [
        { key: "name", en: "name_en", ar: "name_ar" },
        { key: "description", en: "description_en", ar: "description_ar" },
        { key: "title", en: "title_en", ar: "title_ar" },
        { key: "content", en: "content_en", ar: "content_ar" },
    ];

    localizedFields.forEach(({ key, en, ar }) => {
        const source = mapped[key];
        if (!source || typeof source !== "object" || Array.isArray(source)) {
            return;
        }

        if (mapped[en] === undefined) {
            mapped[en] = source.en ?? "";
        }

        if (mapped[ar] === undefined) {
            mapped[ar] = source.ar ?? "";
        }
    });

    for (const [field, mapperFn] of Object.entries(mappers)) {
        mapped[field] = mapperFn(record);
    }

    return mapped;
}
