declare class Store {
    /**
     * 数据体 实时更新
     */
    store?: {
        [key: string]: any;
    };
    constructor();
    /**
     * 从长存储中读取默认用户设置
     * @param key
     * @returns
     */
    Get(key: string): Promise<any>;
    /**
     * 从长存储中读取默认用户设置
     * @param key
     * @returns
     */
    get(key: string): Promise<any>;
    /**
     * 从长存储中设置默认用户设置
     * @param key
     * @param Value
     * @returns
     */
    Set(key: string, Value: any): Promise<any>;
    /**
     * 从长存储中设置默认用户设置
     * @param key
     * @param Value
     * @returns
     */
    set(key: string, Value: any): any;
    /**
     * 从长存储中判断是否存在该key
     * @param key
     * @param Value
     * @returns
     */
    Has(key: string): Promise<boolean>;
    /**
     * 从长存储中判断是否存在该key
     * @param key
     * @param Value
     * @returns
     */
    has(key: string): boolean;
    /**
     * 当store数据初始化完成的时候将返回到 then
     * @returns
     */
    $nextTick(): Promise<unknown>;
    /**
     * 未完成初始化前阻塞进程
     */
    await(): {
        [key: string]: any;
    };
}
interface Store {
    on(key: string, CallBack: (this: {
        [key: string]: any;
    }, newValue: any, oldValue: any) => void): void;
    on(key: "all" | undefined, CallBack: (this: {
        [key: string]: any;
    }, newValue: {
        [key: string]: any;
    }, oldValue: {
        [key: string]: any;
    }, key: string, store?: {
        [key: string]: any;
    }) => void): void;
}
export { Store };
