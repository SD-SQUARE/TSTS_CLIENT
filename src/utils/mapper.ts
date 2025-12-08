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

    for (const [field, mapperFn] of Object.entries(mappers)) {
        mapped[field] = mapperFn(record);
    }

    return mapped;
}
