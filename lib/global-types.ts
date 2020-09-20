type User = Users.User;
type Sesh = Users.Sesh;
type ID = String;
namespace Users {
    export type User = import('./users').User;
    export type Sesh = import('./users').Sesh;
};
