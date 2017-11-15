import {Symbols} from '../symbols';
import {yearFrom} from '../autoRebind';
import {inject, injectable} from 'inversify';
import {IWarrior} from './IWarrior';
import {IArmor} from '../armors';

@injectable()
@yearFrom(0, Symbols.warrior)
@yearFrom(2100, Symbols.warrior)
export class Ninja implements IWarrior {
  @inject(Symbols.armor)
  public armor: IArmor;

  attack() {
    return 'yatah!';
  }
}