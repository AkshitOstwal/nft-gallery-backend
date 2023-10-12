export function toObject(val) {
    return JSON.parse(JSON.stringify(val, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
}