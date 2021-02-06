export class Player {
    constructor(
        public id: number,
        public username: string,
        public name: string,
        public joined: boolean,
        public finish: boolean,
        public finishedTime: number,
        public minuts: number,
        public seconds: number,
        public winner: boolean) {}
}
