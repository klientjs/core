import Event from '../event';
import type Request from '../../services/request/request';
import type { KlientRequestConfig } from '../../services/request/request';
export default class RequestEvent<T = unknown> extends Event {
    request: Request<T>;
    static NAME: string;
    constructor(request: Request<T>);
    get config(): KlientRequestConfig;
    get context(): {
        [x: string]: any;
    };
}
