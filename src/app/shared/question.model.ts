import { Answer } from './answer.model';

export class Question {
    constructor(
        public id: number,
        public playerId: number,
        public title: string,
        public selected: boolean,
        public type: string,
        public answers: Answer[],
        public answered: boolean,
        public correct: boolean,
        public folderId: number) {}
}
