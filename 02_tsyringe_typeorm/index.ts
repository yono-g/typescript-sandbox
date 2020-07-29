import 'reflect-metadata';
import { container, injectable, inject } from 'tsyringe';
import { createConnection, Repository, EntityRepository, getRepository, getConnection } from 'typeorm';
import { User } from './userEntity';

// Ng: injectされずundefinedになる
// @injectable()
// @EntityRepository()
// class UserRepository extends Repository<User> {}

// Ok: injectされる
// @injectable()
// class PseudoUserRepository {
//     create(args: any) {
//         console.log('create called');
//         return new User();
//     }
//     async save(user: User) {
//         console.log('save called');
//         return user;
//     }
// }

// カスタムリポジトリを定義した場合はValue Providerで登録する
// @EntityRepository(User)
// class CustomUserRepository extends Repository<User> {};

interface UserRepositoryInterface {
    create(args: any): User;
    save(user: User): Promise<User>;
}

class UserRepository implements UserRepositoryInterface {
    private readonly repository = getRepository(User);

    create(args: any): User {
        const user = this.repository.create();
        user.name = args.name;
        return user;
    }
    save(user: User) {
        return this.repository.save(user);
    }
}

class UserRepositoryMock implements UserRepositoryInterface {
    create(args: any) {
        console.log('mock create() called');
        return new User;
    }

    async save(user: User) {
        console.log('mock save() called');
        return new User();
    }
}

@injectable()
class DataSeederService {
    constructor(
    //    private userRepository: UserRepository,
    //    private userRepository: PseudoUserRepository,
    //    @inject('UserRepository') private userRepository: Repository<User>,
    //    @inject('CustomUserRepository') private userRepository: CustomUserRepository,
        @inject('UserRepository') private userRepository: UserRepositoryInterface,
    ) {}

    async seed() {
        const user = this.userRepository.create({ name: 'foo' });
        await this.userRepository.save(user);
    }
}

async function main() {
    const connection = await createConnection();

    // Value Providerを使ってインスタンスを登録する
    // container.register('UserRepository', { useValue: connection.getRepository(User) });
    // container.register('CustomUserRepository', { useValue: connection.getCustomRepository(CustomUserRepository) });

    // Class Providerを使ってクラスを登録する
    container.register('UserRepository', { useClass: UserRepository });
    const service = container.resolve(DataSeederService);
    await service.seed();

    // Test:
    container.register('UserRepository', { useClass: UserRepositoryMock });
    const serviceTest = container.resolve(DataSeederService);
    await serviceTest.seed();
}

main().then(() => console.log('done'));
