import 'reflect-metadata';
import { container, injectable, inject } from 'tsyringe';

interface IDogService {
    bark(): string;
}

@injectable()
class DogService implements IDogService {

    bark() {
        return 'bow-wow';
    }
}

@injectable()
class MainClass {
    constructor(@inject('IDogService') private readonly dogService: IDogService) {}

    run(): string {
        return this.dogService.bark();
    }
}

//
// Actual code:
//

container.register('IDogService', { useClass: DogService });

const mainClass = container.resolve(MainClass);
console.log(mainClass.run());

//
// Test code:
//

@injectable()
class DogServiceMock implements IDogService {

    bark() {
        return 'meow';
    }
}

container.register('IDogService', { useClass: DogServiceMock });
const mainTestClass = container.resolve(MainClass);
console.log(mainTestClass.run());
