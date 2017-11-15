import {Symbols} from '../symbols';
import {inject, injectable} from 'inversify';
import {IWarrior} from './IWarrior';
import {IArmor} from '../armors';
import {yearsRebinder} from '../rebinders';

@injectable()
@yearsRebinder.decorator(1990, Symbols.warrior)
export class GunMan implements IWarrior {
  @inject(Symbols.armor)
  public armor: IArmor;

  attack() {
    return 'bang!';
  }
}