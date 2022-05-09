type BuiltIns =
    Date
    | RegExp
    | bigint
    | boolean
    | number
    | string
    | symbol
    | null
    | undefined;

type ReadonlyDeep<T> = T extends BuiltIns
    ? T
    : T extends (...args: never[]) => unknown
        ? { [key: string]: never } extends ReadonlyObjectDeep<T>
            ? T
            : HasMultipleCallSignatures<T> extends true
                ? T
                : ReadonlyObjectDeep<T>
                & ((...args: Parameters<T>) => ReturnType<T>)
        : T extends Readonly<ReadonlyMap<infer KeyType, infer ValueType>>
            ? ReadonlyMapDeep<KeyType, ValueType>
            : T extends Readonly<ReadonlySet<infer ItemType>>
                ? ReadonlySetDeep<ItemType>
                : T extends object
                    ? ReadonlyObjectDeep<T>
                    : unknown;

type ReadonlyMapDeep<KeyType, ValueType> =
    Readonly<ReadonlyMap<ReadonlyDeep<KeyType>, ReadonlyDeep<ValueType>>>;

type ReadonlySetDeep<ItemType> = Readonly<ReadonlySet<ReadonlyDeep<ItemType>>>;

type ReadonlyObjectDeep<ObjectType extends object> = {
    readonly [KeyType in keyof ObjectType]: ReadonlyDeep<ObjectType[KeyType]>
};

type HasMultipleCallSignatures<T extends (...args: never[]) => unknown> =
    T extends { (...args: infer A): unknown, (...args: never[]): unknown }
        ? unknown[] extends A
            ? false
            : true
        : false;

export default ReadonlyDeep;
