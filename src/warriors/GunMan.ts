import {Symbols} from '../symbols';
import {yearFrom} from '../autoRebind';
import {inject, injectable} from 'inversify';
import {IWarrior} from './IWarrior';
import {IArmor} from '../armors';

@injectable()
@yearFrom(1990, Symbols.warrior)
export class GunMan implements IWarrior {
  @inject(Symbols.armor)
  public armor: IArmor;

  attack() {
    return 'bang!';
  }
}