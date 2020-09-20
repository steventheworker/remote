import * as UsersType from './users';
import * as HelpersType from './helpers';

declare global {
    namespace NodeJS {
        interface Global {
            toID: (item: any) => ID;
            helpers: any;
        }
        const Users: typeof UsersType.Users;
        const helpers: typeof HelpersType;
        const toID: typeof helpers.toID;
    }
}
